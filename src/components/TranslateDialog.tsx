import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, ArrowLeftRight, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TranslateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalText: string;
  onSaveTranslation?: (newText: string) => void;
  fontSize?: number;
}

const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

const LANGUAGES = [
  { code: "auto", name: "تلقائي" },
  { code: "en", name: "الإنجليزية" },
  { code: "ar", name: "العربية" },
  { code: "fr", name: "الفرنسية" },
  { code: "es", name: "الإسبانية" },
  { code: "de", name: "الألمانية" },
  { code: "it", name: "الإيطالية" },
  { code: "pt", name: "البرتغالية" },
  { code: "ru", name: "الروسية" },
  { code: "ja", name: "اليابانية" },
  { code: "zh", name: "الصينية" },
  { code: "ko", name: "الكورية" },
  { code: "tr", name: "التركية" },
];

const getLanguageName = (code: string) => {
  const lang = LANGUAGES.find(l => l.code === code);
  return lang?.name || code;
};

export const TranslateDialog = ({
  open,
  onOpenChange,
  originalText,
  onSaveTranslation,
  fontSize = 14,
}: TranslateDialogProps) => {
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open && originalText) {
      setSourceText(originalText);
      setSourceLang("auto");
      setDetectedLang(null);
      translateText(originalText, "auto");
    }
  }, [open, originalText]);

  // Auto-translate with debounce when source text changes
  useEffect(() => {
    if (!open || !sourceText) return;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      translateText(sourceText, sourceLang);
    }, 500);
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [sourceText, sourceLang, targetLang, open]);

  const translateText = async (textToTranslate: string, fromLang: string) => {
    if (!textToTranslate) {
      setTranslatedText("");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`
      );
      
      if (!response.ok) {
        throw new Error('Translation failed');
      }
      
      const data = await response.json();
      
      // Get detected language from response (index 2)
      if (data[2] && fromLang === "auto") {
        setDetectedLang(data[2]);
      }
      
      // تجميع النص المترجم من الاستجابة
      let result = '';
      if (data && data[0]) {
        result = data[0].map((item: any) => item[0]).join('');
      }
      
      setTranslatedText(result || "حدث خطأ في الترجمة.");
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("حدث خطأ في الترجمة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  const swapTexts = () => {
    // تبديل النصوص
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
    
    // تبديل اللغات
    const actualSourceLang = sourceLang === "auto" ? (detectedLang || "en") : sourceLang;
    setSourceLang(targetLang);
    setTargetLang(actualSourceLang);
    setDetectedLang(null);
  };

  const handleSaveTranslation = () => {
    if (onSaveTranslation && translatedText) {
      onSaveTranslation(translatedText);
      toast.success("تم حفظ الترجمة في الملاحظة");
      onOpenChange(false);
    }
  };

  const isRTL = (langCode: string) => RTL_LANGUAGES.includes(langCode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[99vw] max-w-4xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">ترجمة النص</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 sm:space-y-3 mt-2">
          {/* Language Selectors Row */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-1 sm:gap-2 items-end">
            {/* Target Language Selector - Left */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold block">اللغة المترجمة</Label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.filter(l => l.code !== "auto").map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Swap Button between language selectors */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={swapTexts}
              title="تبديل النصين"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>

            {/* Source Language Selector - Right */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold block">
                اللغة الأصلية
                {sourceLang === "auto" && detectedLang && (
                  <span className="text-xs text-muted-foreground mr-1">
                    ({getLanguageName(detectedLang)})
                  </span>
                )}
              </Label>
              <Select value={sourceLang} onValueChange={(val) => {
                setSourceLang(val);
                if (val !== "auto") setDetectedLang(null);
              }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Text Areas Row - Side by Side */}
          <div className="flex flex-row gap-2">
            {/* Source Text - Right */}
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">النص الأصلي</Label>
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="min-h-[180px] sm:min-h-[220px] max-h-[300px] resize-none text-sm sm:text-base"
                style={{ fontSize: `${Math.max(fontSize - 2, 12)}px` }}
                placeholder="اكتب النص هنا..."
                dir={sourceLang === "auto" ? (detectedLang && RTL_LANGUAGES.includes(detectedLang) ? "rtl" : "ltr") : (isRTL(sourceLang) ? "rtl" : "ltr")}
              />
            </div>

            {/* Translated Text - Left */}
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">الترجمة</Label>
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[180px] sm:min-h-[220px] border rounded-md bg-muted">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <Textarea
                  value={translatedText}
                  onChange={(e) => setTranslatedText(e.target.value)}
                  className="min-h-[180px] sm:min-h-[220px] max-h-[300px] resize-none text-sm sm:text-base"
                  style={{ fontSize: `${Math.max(fontSize - 2, 12)}px` }}
                  placeholder="الترجمة ستظهر هنا..."
                  dir={isRTL(targetLang) ? "rtl" : "ltr"}
                />
              )}
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap gap-2 justify-center sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-1 sm:items-center">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs sm:text-sm flex-1 sm:flex-none"
              onClick={() => copyToClipboard(translatedText, "الترجمة")}
              disabled={!translatedText}
            >
              <Copy className="h-3 w-3 ml-1" />
              <span className="hidden xs:inline">نسخ</span> الترجمة
            </Button>

            {onSaveTranslation && (
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-xs sm:text-sm flex-1 sm:flex-none"
                onClick={handleSaveTranslation}
                disabled={!translatedText}
              >
                <Save className="h-3 w-3 ml-1" />
                حفظ
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs sm:text-sm flex-1 sm:flex-none"
              onClick={() => copyToClipboard(sourceText, "النص الأصلي")}
            >
              <Copy className="h-3 w-3 ml-1" />
              <span className="hidden xs:inline">نسخ</span> الأصلي
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
