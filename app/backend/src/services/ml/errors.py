class LabError(Exception):
    def __init__(self, detail, status=422):
        super().__init__(detail)
        self.detail, self.status = detail, status
