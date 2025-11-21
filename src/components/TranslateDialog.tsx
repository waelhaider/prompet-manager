import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface TranslateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalText: string;
}

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
}: TranslateDialogProps) => {
  const [targetLang, setTargetLang] = useState("en");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && originalText) {
      translateText();
    }
  }, [open, targetLang, originalText]);

  const translateText = async () => {
    setIsLoading(true);
    try {
      // استخدام Google Translate API غير الرسمي
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(originalText)}`
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ترجمة النص</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="flex justify-center">
            <div className="w-64">
              <Label>اللغة المستهدفة</Label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger>
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

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold">النص الأصلي</Label>
              <Card className="p-4 min-h-[300px] max-h-[500px] overflow-y-auto bg-muted border-2">
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">{originalText}</p>
              </Card>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">الترجمة</Label>
              <Card className="p-4 min-h-[300px] max-h-[500px] overflow-y-auto bg-muted border-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">{translatedText}</p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
