class CapabilitiesConfig:
    def __init__(self, code_execution: bool = False, google_search: bool = False, enable_subagents: bool = True):
        self.code_execution = code_execution
        self.google_search = google_search
        self.enable_subagents = enable_subagents
