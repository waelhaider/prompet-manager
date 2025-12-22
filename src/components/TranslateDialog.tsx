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
}

const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

const LANGUAGES = [
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

export const TranslateDialog = ({
  open,
  onOpenChange,
  originalText,
  onSaveTranslation,
}: TranslateDialogProps) => {
  const [sourceLang, setSourceLang] = useState("ar");
  const [targetLang, setTargetLang] = useState("en");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open && originalText) {
      setSourceText(originalText);
      translateText(originalText);
    }
  }, [open, originalText]);

  // Auto-translate with debounce when source text changes
  useEffect(() => {
    if (!open || !sourceText || sourceLang === targetLang) return;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      translateText(sourceText);
    }, 500); // Wait 500ms after user stops typing
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [sourceText, sourceLang, targetLang, open]);

  const translateText = async (textToTranslate: string) => {
    if (!textToTranslate || sourceLang === targetLang) {
      setTranslatedText(textToTranslate);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`
      );
      
      if (!response.ok) {
        throw new Error('Translation failed');
      }
      
      const data = await response.json();
      
      // تجميع النص المترجم من الاستجابة
      let translatedText = '';
      if (data && data[0]) {
        translatedText = data[0].map((item: any) => item[0]).join('');
      }
      
      setTranslatedText(translatedText || "حدث خطأ في الترجمة.");
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
    const tempText = sourceText;
    const tempLang = sourceLang;
    setSourceText(translatedText);
    setSourceLang(targetLang);
    setTranslatedText(tempText);
    setTargetLang(tempLang);
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
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">ترجمة النص</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-start">
            {/* Source Language Section */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold block">اللغة الأصلية</Label>
              <Select value={sourceLang} onValueChange={setSourceLang}>
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
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="min-h-[180px] max-h-[250px] text-sm resize-none"
                placeholder="اكتب النص هنا..."
                dir={isRTL(sourceLang) ? "rtl" : "ltr"}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8"
                onClick={() => copyToClipboard(sourceText, "النص الأصلي")}
              >
                <Copy className="h-3 w-3 ml-1" />
                نسخ الأصلي
              </Button>
            </div>

            {/* Swap Button */}
            <div className="flex items-center justify-center pt-14">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={swapTexts}
                title="تبديل النصين"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Target Language Section */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold block">اللغة المترجمة</Label>
              <Select value={targetLang} onValueChange={setTargetLang}>
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
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[180px] border rounded-md bg-muted">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <Textarea
                  value={translatedText}
                  onChange={(e) => setTranslatedText(e.target.value)}
                  className="min-h-[180px] max-h-[250px] text-sm resize-none"
                  placeholder="الترجمة ستظهر هنا..."
                  dir={isRTL(targetLang) ? "rtl" : "ltr"}
                />
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8"
                onClick={() => copyToClipboard(translatedText, "الترجمة")}
                disabled={!translatedText}
              >
                <Copy className="h-3 w-3 ml-1" />
                نسخ الترجمة
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center gap-2 pt-2">
            <Button
              size="sm"
              className="h-8"
              onClick={() => translateText(sourceText)}
              disabled={isLoading || !sourceText || sourceLang === targetLang}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ترجم"}
            </Button>
            {onSaveTranslation && (
              <Button
                size="sm"
                variant="secondary"
                className="h-8"
                onClick={handleSaveTranslation}
                disabled={!translatedText}
              >
                <Save className="h-3 w-3 ml-1" />
                حفظ الترجمة
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
