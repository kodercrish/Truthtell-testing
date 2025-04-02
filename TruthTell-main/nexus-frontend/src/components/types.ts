// interface CredibilityMetrics {
//   bias_rating: string;
//   credibility_score: number;
//   fact_checking_history: number;
// }

// interface SourceAssessment {
//   url: string;
//   credibility_metrics: CredibilityMetrics;
//   relevance_to_claim: number;
// }

// interface RecommendedSource {
//   credibility_score: number;
//   relevance: number;
//   url: string;
// }

// interface CorrectionSuggestions {
//   context_missing: string[];
//   recommended_sources: RecommendedSource[];
//   verified_facts: string[];
// }

// interface EvidenceQuality {
//   contradictions: string[];
//   gaps: string[];
//   strength: number;
// }

interface MisinformationImpact {
  affected_domains: string[];
  potential_consequences: string[];
  severity: number;
  spread_risk: number;
}

interface ClaimAnalysis {
  claim: string; //
  confidence_level: number; //
  misinformation_impact: MisinformationImpact; //
  verification_status: string; //
}

// interface MetaAnalysis {
//   information_ecosystem_impact: string;
//   prevention_strategies: string[];
//   recommended_actions: string[];
// }

interface OverallAnalysis {
  key_findings: string[];
  reliability_assessment: string;
  truth_score: number;
}

interface SourceAssessment {
  source: string; //
  credibility_score: number; //
  fact_checking_history: number; //
  transparency_score: number; //
  expertise_level: number; //
  additional_metrics: {
    citation_score: number;
    peer_recognition: number;
  }
}

interface FactCheckResult {
  claim_analysis: ClaimAnalysis[]; //
  // meta_analysis: MetaAnalysis; //
  overall_analysis: OverallAnalysis; //
  source_analysis: SourceAssessment[]; //
}

// interface ClaimExplanation {
//   claim: string;
//   confidence_explanation: string;
//   key_factors: string[];
//   reasoning: string;
// }

// interface EvidenceAnalysis {
//   contradiction_details: string;
//   gap_analysis: string;
//   strength_explanation: string;
// }

// interface TrustFactor {
//   factor: string;
//   impact: string;
//   recommendation: string;
// }

// interface Explanation {
//   claim_explanations: ClaimExplanation[];
//   evidence_analysis: EvidenceAnalysis;
//   explanation_summary: string;
//   trust_factors: TrustFactor[];
// }

export interface UserInputObject {
  fact_check_result: {
    detailed_analysis: FactCheckResult;
  }; //
  sources: string[]; //
  // explanation: Explanation; //
}

export interface UserInputOutput {
  status: string;
  content: UserInputObject;
}
