import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

const ExpertAdvisory = () => {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          National Agronomic Fertilizer Advisory
        </h1>
        <p className="text-xs text-gray-500">
          Official agronomic guidelines endorsed by Ethiopian Agricultural Extension Services
        </p>
      </div>

      {/* English Guidelines */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-agri-800">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-base font-bold uppercase tracking-wider">
            Standard Application Guidelines (English)
          </h2>
        </div>

        <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
          <div className="p-4 bg-agri-50/60 rounded-xl border border-agri-100">
            <h3 className="font-bold text-gray-900 mb-1">1. DAP (Di-Ammonium Phosphate) - Basal Application</h3>
            <p>
              Apply 100% of the authorized DAP quota during sowing. Place fertilizer 5 cm below or to the side of the seed. Never place DAP directly in contact with moist seeds to prevent chemical seedling burn.
            </p>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
            <h3 className="font-bold text-gray-900 mb-1">2. UREA - Split Top-Dressing Application</h3>
            <p>
              Urea is highly volatile and water-soluble. Do not apply all Urea at planting.
              Split the quota into two equal portions:
              <br />• <strong>First Split (50%):</strong> Apply 30 to 35 days after emergence during initial tillering/weeding.
              <br />• <strong>Second Split (50%):</strong> Apply before panicle initiation/flowering (55-60 days). Always cover with light soil after spreading.
            </p>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100">
            <h3 className="font-bold text-gray-900 mb-1">3. Vertisol (Walka / Black Soil) Moisture Management</h3>
            <p>
              On heavy Vertisols, ensure broad beds and furrows (BBM) are constructed to drain excess water, as waterlogged conditions cause significant nitrogen leaching from Urea.
            </p>
          </div>
        </div>
      </div>

      {/* Amharic Guidelines */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-4 font-ethiopic">
        <div className="flex items-center space-x-2 text-emerald-800">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-base font-bold tracking-wider">
            ሳይንሳዊ የማዳበሪያ አጠቃቀም መመሪያ (አማርኛ)
          </h2>
        </div>

        <div className="space-y-4 text-xs text-gray-800 leading-relaxed">
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <h3 className="font-bold text-gray-900 mb-1">፩. የዳፕ (DAP) ማዳበሪያ አጠቃቀም</h3>
            <p>
              የተፈቀደውን የዳፕ ማዳበሪያ መጠን ሙሉ በሙሉ በዘር ወቅት ይጠቀሙ። ማዳበሪያው ከዘሩ ስር በ5 ሳንቲ ሜትር ርቀት ላይ እንዲያርፍ ያድርጉ። ዘሩ እንዳይቃጠል ማዳበሪያውን በቀጥታ ከዘሩ ጋር አያነካኩ።
            </p>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <h3 className="font-bold text-gray-900 mb-1">፪. የዩሪያ (UREA) ማዳበሪያ በሁለት ጊዜያት አጠቃቀም</h3>
            <p>
              ዩሪያ በቀላሉ በንፋስና በውሃ ስለሚባክን በአንድ ጊዜ አይጨመሩ። የተፈቀደውን መጠን ለሁለት እኩል ከፍለው ይጠቀሙ፡
              <br />• <strong>የመጀመሪያው ዙር (50%):</strong> ሰብሉ ከተበቀለ ከ30 እስከ 35 ቀናት በኋላ በመጀመሪያው አረም ወቅት።
              <br />• <strong>ሁለተኛው ዙር (50%):</strong> ሰብሉ ማበብ ከመጀመሩ በፊት (ከ55 እስከ 60 ቀናት)። ማዳበሪያውን ከበተኑ በኋላ ወዲያውኑ አፈር ያለብሱት።
            </p>
          </div>

          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
            <h3 className="font-bold text-gray-900 mb-1">፫. የዋልካ (ጥቁር) አፈር አያያዝ</h3>
            <p>
              በጥቁር አፈር ላይ ውሃ እንዳይተኛ ቦይ በማውጣት ትርፍ ውሃውን ያስወግዱ። ውሃ ሲተኛ ናይትሮጅን ስለሚታፈን የሰብሉን ምርታማነት ይቀንሳል።
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertAdvisory;
