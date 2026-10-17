"""Verify a saved rollback image without joining a real Docker Compose project.

The verifier creates one isolated container and retains it stopped as evidence.
It never removes containers, images, networks or volumes.
"""
import argparse
import json
import subprocess
import uuid
from pathlib import Path

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('phase', choices=['dev', 'test'])
p.add_argument('--evidence', type=Path, required=True)
a = p.parse_args()
evidence = a.evidence.resolve()
snapshot = json.loads((evidence / f'{a.phase}-snapshot.json').read_text())
before = json.loads((evidence / 'before.json').read_text())
expected = before['containers'][f'equacionei-{a.phase}-backend-1']['hashes']

def output(*args):
    return subprocess.check_output(args, text=True).strip()

image = json.loads(output('docker', 'image', 'inspect', snapshot['tag']))[0]
assert image['Id'] == snapshot['snapshot_image'], 'Rollback tag changed'
assert not image['Config'].get('Volumes'), 'Unexpected image volumes'
labels = {key: '' for key in (image['Config'].get('Labels') or {}) if key.startswith('com.docker.compose.')}
labels.update({
    'com.docker.compose.project': 'equacionei-rollback-audit',
    'com.docker.compose.service': 'verification',
    'com.docker.compose.oneoff': 'True',
    'equacionei.audit.purpose': 'rollback-verification',
})
code = "from pathlib import Path;import hashlib,json;print(json.dumps({str(p):hashlib.sha256(p.read_bytes()).hexdigest() for base in ['/app/src','/app/frontend'] for p in Path(base).rglob('*') if p.is_file() and '__pycache__' not in p.parts}))"
name = f'equacionei-audit-rollback-{a.phase}-{uuid.uuid4().hex[:8]}'
command = ['docker', 'create', '--name', name, '--network', 'none', '--read-only', '-e', 'PYTHONDONTWRITEBYTECODE=1']
for key, value in labels.items():
    command.extend(['--label', f'{key}={value}'])
command.extend(['--entrypoint', 'python', snapshot['tag'], '-c', code])
container_id = output(*command)
record = {'container_id': container_id, 'name': name, 'image': snapshot['snapshot_image'], 'runtime_restoration_performed': False}
(evidence / f'{a.phase}-rollback-verifier-created.json').write_text(json.dumps(record, indent=2))
container = json.loads(output('docker', 'inspect', container_id))[0]
actual_labels = container['Config'].get('Labels') or {}
assert container['State']['Status'] == 'created'
assert container['Image'] == snapshot['snapshot_image']
assert actual_labels['com.docker.compose.project'] == 'equacionei-rollback-audit'
assert actual_labels['com.docker.compose.service'] == 'verification'
assert actual_labels['com.docker.compose.oneoff'] == 'True'
assert not container['Mounts'] and not container['HostConfig'].get('VolumesFrom')
assert container['HostConfig']['NetworkMode'] == 'none' and container['HostConfig']['ReadonlyRootfs']
for phase in ['dev', 'test', 'prod']:
    selected = output('docker', 'ps', '-aq', '--no-trunc', '--filter', f'label=com.docker.compose.project=equacionei-{phase}', '--filter', 'label=com.docker.compose.service=backend').splitlines()
    assert container_id not in selected, 'Verifier is selectable as a live service'
result = subprocess.run(['docker', 'start', '--attach', container_id], capture_output=True, text=True, timeout=30)
assert result.returncode == 0, result.stderr
final = json.loads(output('docker', 'inspect', container_id))[0]
assert final['State']['Status'] == 'exited' and final['State']['ExitCode'] == 0
actual = json.loads(result.stdout)
mismatches = [path for path in set(actual) | set(expected) if actual.get(path) != expected.get(path)]
assert not mismatches, mismatches
record.update({'files': len(actual), 'mismatches': mismatches, 'labels': actual_labels, 'excluded_from_live_compose_projects': True, 'read_only': True, 'mounts': [], 'state': final['State']['Status']})
(evidence / f'{a.phase}-rollback-verification.json').write_text(json.dumps(record, indent=2))
print(f'{a.phase}: rollback verified, {len(actual)} files; verifier excluded from DEV/TESTE/PROD Compose projects; container {container_id}')
