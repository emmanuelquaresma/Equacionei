/* Gerado por data-science/dama/web/train.py. */
const DamaModels = {
  "ruleset": "equacionei-short-v1",
  "features": [
    "dif_pedras",
    "dif_damas",
    "dif_avanco",
    "dif_centro",
    "dif_retaguarda",
    "dif_bordas"
  ],
  "regression": {
    "w": [
      0.49656082255898176,
      0.9150410763639282,
      0.10227358469292802,
      -0.045451735500030954,
      0.15324775392031592,
      0.02226437660187347
    ],
    "b": -0.0547344486197756
  },
  "td": {
    "w": [
      0.6118976559684886,
      0.8482524686756734,
      -0.513073138351727,
      0.09154947193853927,
      0.10822192843822748,
      0.07064967313494687
    ],
    "b": -0.17423285820423834
  },
  "metadata": {
    "seed": 20260927,
    "games": 400,
    "episodes": 600,
    "decisive": 397,
    "truncated": 3,
    "trainPositions": 18891,
    "testPositions": 5102,
    "split": "game-index-mod-5",
    "testAccuracy": 0.7259898079184633,
    "rolloutCutoff": 200,
    "trainer": "web/train.js"
  }
};
