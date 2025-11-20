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
      const chunkSize = 400;
      const chunks: string[] = [];
      
      // تقسيم النص بذكاء
      if (originalText.length <= chunkSize) {
        chunks.push(originalText);
      } else {
        let remaining = originalText;
        
        while (remaining.length > 0) {
          if (remaining.length <= chunkSize) {
            chunks.push(remaining);
            break;
          }
          
          // محاولة القطع عند نهاية جملة أو سطر
          let cutPoint = chunkSize;
          const substring = remaining.substring(0, chunkSize);
          
          // البحث عن آخر نقطة، سطر جديد، أو مسافة
          const lastNewline = substring.lastIndexOf('\n');
          const lastPeriod = substring.lastIndexOf('.');
          const lastSpace = substring.lastIndexOf(' ');
          
          cutPoint = Math.max(lastNewline, lastPeriod, lastSpace);
          
          // إذا لم نجد أي نقطة قطع مناسبة، نقطع عند الحد الأقصى
          if (cutPoint <= 0 || cutPoint < chunkSize / 2) {
            cutPoint = chunkSize;
          }
          
          chunks.push(remaining.substring(0, cutPoint).trim());
          remaining = remaining.substring(cutPoint).trim();
        }
      }

      // ترجمة كل جزء مع انتظار قصير بين الطلبات
      const translatedChunks: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        if (i > 0) {
          // انتظار 500ms بين الطلبات لتجنب الحظر
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
            chunks[i]
          )}&langpair=ar|${targetLang}`
        );
        const data = await response.json();
        
        if (data.responseStatus === "403" || data.responseData.translatedText.includes("QUERY LENGTH LIMIT")) {
          // إذا فشل، حاول تقسيم هذا الجزء إلى نصفين
          const halfSize = Math.floor(chunks[i].length / 2);
          const firstHalf = chunks[i].substring(0, halfSize);
          const secondHalf = chunks[i].substring(halfSize);
          
          // ترجمة النصف الأول
          const response1 = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
              firstHalf
            )}&langpair=ar|${targetLang}`
          );
          const data1 = await response1.json();
          translatedChunks.push(data1.responseData.translatedText);
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // ترجمة النصف الثاني
          const response2 = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
              secondHalf
            )}&langpair=ar|${targetLang}`
          );
          const data2 = await response2.json();
          translatedChunks.push(data2.responseData.translatedText);
        } else {
          translatedChunks.push(data.responseData.translatedText);
        }
      }
      
      setTranslatedText(translatedChunks.join(" "));
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
