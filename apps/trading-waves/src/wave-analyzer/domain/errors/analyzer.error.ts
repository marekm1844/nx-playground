export class AnalyzerError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AnalyzerError';
    }
  }
  