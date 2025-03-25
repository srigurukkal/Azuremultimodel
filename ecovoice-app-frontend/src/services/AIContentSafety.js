import { default as ContentSafetyClient, isUnexpected } from '@azure-rest/ai-content-safety';
import { AzureKeyCredential } from '@azure/core-auth';

class AIContentSafety {
  constructor() {
    if (!process.env.REACT_APP_CONTENT_SAFETY_ENDPOINT || !process.env.REACT_APP_CONTENT_SAFETY_KEY) {
      throw new Error('Content Safety credentials not configured');
    }

    const credential = new AzureKeyCredential(process.env.REACT_APP_CONTENT_SAFETY_KEY);
    this.client = ContentSafetyClient(process.env.REACT_APP_CONTENT_SAFETY_ENDPOINT, credential);
  }

  async analyzeSafetyRisks(content) {
    const violations = [];
    let maxSeverity = 0;
  
    if (content.text) {
      try {
        const result = await this.client.path('/text:analyze').post({
          body: { text: content.text }
        });

        if (isUnexpected(result)) {
          throw result;
        }

        result.body.categoriesAnalysis.forEach(analysis => {
          if (analysis.severity > this.getThresholdForCategory(analysis.category)) {
            violations.push(
              `${analysis.category} content detected (${(analysis.severity * 100).toFixed(1)}%)`
            );
            maxSeverity = Math.max(maxSeverity, analysis.severity);
          }
        });
      } catch (error) {
        console.error('Content analysis failed:', error);
        throw error;
      }
    }
  
    return {
      isSafe: violations.length === 0,
      severity: this.mapSeverityLevel(maxSeverity),
      categories: this.extractCategories(violations),
      details: violations
    };
  }

  getThresholdForCategory(category) {
    const thresholds = {
      Hate: 0.4,
      SelfHarm: 0.3,
      Sexual: 0.3,
      Violence: 0.4
    };
    return thresholds[category] || 0.5;
  }

  mapSeverityLevel(score) {
    if (score < 0.3) return 'low';
    if (score < 0.6) return 'medium';
    return 'high';
  }

  extractCategories(violations) {
    return violations.map(v => v.split(' ')[0]);
  }
}

export default new AIContentSafety();