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
      // تقسيم النص إلى أجزاء أصغر من 500 حرف
      const chunkSize = 400; // نستخدم 400 لنكون في الجانب الآمن
      const chunks: string[] = [];
      
      if (originalText.length <= chunkSize) {
        chunks.push(originalText);
      } else {
        // تقسيم النص عند الأسطر أو المسافات
        const sentences = originalText.split(/\n/);
        let currentChunk = "";
        
        for (const sentence of sentences) {
          if ((currentChunk + sentence).length <= chunkSize) {
            currentChunk += (currentChunk ? "\n" : "") + sentence;
          } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = sentence;
          }
        }
        if (currentChunk) chunks.push(currentChunk);
      }

      // ترجمة كل جزء
      const translatedChunks: string[] = [];
      for (const chunk of chunks) {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
            chunk
          )}&langpair=ar|${targetLang}`
        );
        const data = await response.json();
        
        if (data.responseStatus === "403") {
          throw new Error("النص طويل جداً للترجمة");
        }
        
        translatedChunks.push(data.responseData.translatedText);
      }
      
      setTranslatedText(translatedChunks.join("\n"));
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("حدث خطأ في الترجمة. النص قد يكون طويلاً جداً.");
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
