import type { ProjectDocument, ExtractionState } from "@/types";

interface DocumentListProps {
  documents: ProjectDocument[];
  extractionState?: ExtractionState;
  onSelect?: (doc: ProjectDocument) => void;
}

const DOC_TYPE_ABBREV: Record<string, string> = {
  "product-description": "PD",
  "timeline": "TL",
  "swot-analysis": "SW",
  "market-research": "MR",
  "financial-projections": "FP",
  "funding-requirements": "FR",
  "product-forecast": "PF",
  "competitive-analysis": "CA",
  "executive-summary": "ES",
};

export function DocumentList({ documents, extractionState, onSelect }: DocumentListProps) {
  return (
    <div>
      {documents.map((doc, i) => {
        const stateEntry = extractionState?.[doc.type];
        const isComplete = stateEntry?.is_complete ?? (doc.fields?.is_complete === true);
        const abbrev = DOC_TYPE_ABBREV[doc.type] || "??";

        const inner = (
          <>
            {/* Check circle */}
            <div className="flex-shrink-0">
              {isComplete ? (
                <div
                  className="flex items-center justify-center bg-black text-white"
                  style={{ width: "28px", height: "28px", borderRadius: "50%" }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : (
                <div
                  className="border border-gray-200"
                  style={{ width: "28px", height: "28px", borderRadius: "50%" }}
                />
              )}
            </div>

            {/* Document info */}
            <div className="min-w-0 flex-1">
              <p
                className={`text-[13px] font-bold truncate leading-tight ${
                  isComplete ? "text-black" : "text-gray-400"
                }`}
              >
                {doc.title}
              </p>
            </div>

            {/* Type abbreviation */}
            <span
              className={`text-[10px] font-mono tracking-wider flex-shrink-0 ${
                isComplete ? "text-black" : "text-gray-200"
              }`}
            >
              {abbrev}
            </span>
          </>
        );

        const rowStyle = {
          padding: "14px 20px",
          gap: "14px",
          borderBottom: i < documents.length - 1 ? "1px solid #f0f0f0" : "none",
        };

        return isComplete && onSelect ? (
          <button
            key={doc.id}
            onClick={() => onSelect(doc)}
            className="w-full flex items-center hover:bg-[#fafafa] transition-colors group text-left"
            style={rowStyle}
          >
            {inner}
          </button>
        ) : (
          <div
            key={doc.id}
            className={`flex items-center ${isComplete ? "" : "opacity-60 cursor-default"}`}
            style={rowStyle}
          >
            {inner}
          </div>
        );
      })}

      {documents.length === 0 && (
        <div className="text-center" style={{ padding: "48px 24px" }}>
          <p className="text-[13px] text-gray-200">
            No documents generated yet.
          </p>
        </div>
      )}
    </div>
  );
}
