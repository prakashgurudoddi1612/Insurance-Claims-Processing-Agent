import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const InsuranceClaimsAgent = () => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const extractTextFromFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsText(file);
    });
  };

  const parseACORDForm = (text) => {
    const extracted = {
      policyNumber: '',
      policyholderName: '',
      effectiveDates: '',
      incidentDate: '',
      incidentTime: '',
      incidentLocation: '',
      incidentDescription: '',
      claimant: '',
      thirdParties: [],
      contactDetails: '',
      assetType: '',
      assetID: '',
      estimatedDamage: '',
      claimType: 'Auto',
      attachments: [],
      initialEstimate: ''
    };

    const policyMatch = text.match(/POLICY NUMBER[:\s]+([A-Z0-9-]+)/i);
    if (policyMatch) extracted.policyNumber = policyMatch[1].trim();

    const nameMatch = text.match(/NAME OF INSURED[^)]+\)\s+([A-Z\s,]+)/i);
    if (nameMatch) extracted.policyholderName = nameMatch[1].trim().split('\n')[0];

    const dateMatch = text.match(/DATE OF LOSS[^)]+\)\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
    if (dateMatch) extracted.incidentDate = dateMatch[1].trim();

    const timeMatch = text.match(/TIME[:\s]+(AM|PM)/i);
    if (timeMatch) extracted.incidentTime = timeMatch[0].trim();

    const locationMatch = text.match(/LOCATION OF LOSS[^]+?STREET[:\s]+([^\n]+)/i);
    if (locationMatch) extracted.incidentLocation = locationMatch[1].trim();

    const cityMatch = text.match(/CITY, STATE, ZIP[:\s]+([^\n]+)/i);
    if (cityMatch) {
      extracted.incidentLocation += ', ' + cityMatch[1].trim();
    }

    const descMatch = text.match(/DESCRIPTION OF ACCIDENT[^)]+\)([^]+?)(?=LOSS|DRIVER'S NAME|$)/i);
    if (descMatch) extracted.incidentDescription = descMatch[1].trim().substring(0, 200);

    const driverMatch = text.match(/DRIVER'S NAME AND ADDRESS[^)]+\)([A-Z\s,]+)/i);
    if (driverMatch) extracted.claimant = driverMatch[1].trim().split('\n')[0];

    const vinMatch = text.match(/V\.I\.N\.[:\s]+([A-Z0-9]+)/i);
    if (vinMatch) extracted.assetID = vinMatch[1].trim();

    const makeMatch = text.match(/MAKE[:\s]+([A-Z0-9\s]+)/i);
    const modelMatch = text.match(/MODEL[:\s]+([A-Z0-9\s]+)/i);
    if (makeMatch && modelMatch) {
      extracted.assetType = `${makeMatch[1].trim()} ${modelMatch[1].trim()}`;
    }

    const estimateMatch = text.match(/ESTIMATE AMOUNT[:\s]+\$?([\d,]+)/i);
    if (estimateMatch) {
      extracted.estimatedDamage = estimateMatch[1].trim().replace(',', '');
      extracted.initialEstimate = estimateMatch[1].trim().replace(',', '');
    }

    return extracted;
  };

  const identifyMissingFields = (extracted) => {
    const missing = [];
    const requiredFields = {
      policyNumber: 'Policy Number',
      policyholderName: 'Policyholder Name',
      incidentDate: 'Incident Date',
      incidentLocation: 'Incident Location',
      incidentDescription: 'Incident Description',
      claimant: 'Claimant Name',
      assetType: 'Asset Type',
      assetID: 'Asset ID (VIN)',
      estimatedDamage: 'Estimated Damage'
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!extracted[key] || extracted[key].trim() === '') {
        missing.push(label);
      }
    }

    return missing;
  };

  const routeClaim = (extracted, missingFields) => {
    let route = '';
    let reasoning = '';

    if (missingFields.length > 0) {
      route = 'Manual Review';
      reasoning = `Missing ${missingFields.length} mandatory field(s): ${missingFields.join(', ')}. Requires manual verification before processing.`;
      return { route, reasoning };
    }

    const fraudKeywords = ['fraud', 'inconsistent', 'staged', 'suspicious', 'false'];
    const description = (extracted.incidentDescription || '').toLowerCase();
    const hasFraudIndicator = fraudKeywords.some(keyword => description.includes(keyword));
    
    if (hasFraudIndicator) {
      route = 'Investigation Queue';
      reasoning = 'Description contains potential fraud indicators. Flagged for special investigation unit review.';
      return { route, reasoning };
    }

    const injuryKeywords = ['injury', 'injured', 'hurt', 'hospital', 'medical', 'ambulance'];
    const hasInjury = injuryKeywords.some(keyword => description.includes(keyword));
    
    if (hasInjury) {
      route = 'Specialist Queue';
      reasoning = 'Claim involves personal injury. Routed to bodily injury specialist for assessment.';
      return { route, reasoning };
    }

    const damage = parseFloat(extracted.estimatedDamage || '0');
    if (damage > 0 && damage < 25000) {
      route = 'Fast-track';
      reasoning = `Estimated damage of $${damage.toLocaleString()} is below $25,000 threshold. Eligible for expedited processing.`;
    } else if (damage >= 25000) {
      route = 'Standard Processing';
      reasoning = `Estimated damage of $${damage.toLocaleString()} exceeds fast-track threshold. Requires standard adjuster review.`;
    } else {
      route = 'Manual Review';
      reasoning = 'Unable to determine damage amount. Requires manual assessment.';
    }

    return { route, reasoning };
  };

  const processFile = async () => {
    if (!file) return;

    setProcessing(true);
    
    try {
      const text = await extractTextFromFile(file);
      const extracted = parseACORDForm(text);
      const missing = identifyMissingFields(extracted);
      const { route, reasoning } = routeClaim(extracted, missing);
      
      const output = {
        extractedFields: extracted,
        missingFields: missing,
        recommendedRoute: route,
        reasoning: reasoning
      };
      
      setResult(output);
    } catch (error) {
      console.error('Processing error:', error);
      setResult({
        error: 'Failed to process file. Please ensure it is a valid FNOL document.'
      });
    }
    
    setProcessing(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const getRouteColor = (route) => {
    switch (route) {
      case 'Fast-track':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Manual Review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Investigation Queue':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Specialist Queue':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Standard Processing':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="flex items-center mb-6">
            <FileText className="w-10 h-10 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Insurance Claims Processing Agent</h1>
              <p className="text-gray-600">Autonomous FNOL Document Analysis & Routing</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload FNOL Document (TXT or PDF)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <button
                onClick={processFile}
                disabled={!file || processing}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Process
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {result && !result.error && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Routing Decision
              </h2>
              <div className={`p-4 rounded-lg border-2 ${getRouteColor(result.recommendedRoute)}`}>
                <div className="text-2xl font-bold mb-2">{result.recommendedRoute}</div>
                <div className="text-sm">{result.reasoning}</div>
              </div>
            </div>

            {result.missingFields.length > 0 && (
              <div className="bg-white rounded-lg shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                  Missing Fields ({result.missingFields.length})
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {result.missingFields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <XCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-gray-700">{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                Extracted Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(result.extractedFields).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-200 pb-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm text-gray-800">
                      {value || <span className="text-gray-400 italic">Not found</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">JSON Output</h2>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {result && result.error && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-6 h-6" />
              <span className="font-semibold">{result.error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceClaimsAgent;