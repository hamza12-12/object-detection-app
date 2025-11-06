import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Camera, Download, Play, Square, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface Detection {
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
}

export default function ObjectDetection() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [averageConfidence, setAverageConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const saveDetectionMutation = trpc.detection.save.useMutation();
  const listDetectionsQuery = trpc.detection.list.useQuery(undefined, {
    enabled: !!user,
  });

  // تحميل نموذج TensorFlow.js
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // تحميل مكتبات TensorFlow.js
        const script1 = document.createElement("script");
        script1.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0";
        script1.async = true;

        const script2 = document.createElement("script");
        script2.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3";
        script2.async = true;

        script1.onload = () => {
          script2.onload = async () => {
            try {
              const cocoSsd = (window as any).cocoSsd;
              const model = await cocoSsd.load();
              modelRef.current = model;
              setIsLoading(false);
            } catch (err) {
              setError("فشل تحميل نموذج الكشف عن الأشياء");
              console.error(err);
              setIsLoading(false);
            }
          };
          script2.onerror = () => {
            setError("فشل تحميل مكتبة COCO-SSD");
            setIsLoading(false);
          };
          document.body.appendChild(script2);
        };

        script1.onerror = () => {
          setError("فشل تحميل TensorFlow.js");
          setIsLoading(false);
        };

        document.body.appendChild(script1);
      } catch (err) {
        setError("خطأ في تحميل النموذج");
        console.error(err);
        setIsLoading(false);
      }
    };

    loadModel();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  // تفعيل الكاميرا
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          detectObjects();
        };
      }
    } catch (err) {
      setError("فشل الوصول إلى الكاميرا. تأكد من منح الأذونات.");
      console.error(err);
    }
  };

  // إيقاف الكاميرا
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsCameraActive(false);
      setDetections([]);

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    }
  };

  // الكشف عن الأشياء
  const detectObjects = async () => {
    if (!videoRef.current || !canvasRef.current || !modelRef.current || !isCameraActive) {
      return;
    }

    try {
      const predictions = await modelRef.current.detect(videoRef.current);

      // تحديث الكشوفات
      const formattedDetections: Detection[] = predictions.map((pred: any) => ({
        label: pred.class,
        confidence: Math.round(pred.score * 100),
        bbox: pred.bbox,
      }));

      setDetections(formattedDetections);

      if (formattedDetections.length > 0) {
        const avgConfidence = Math.round(
          formattedDetections.reduce((sum, d) => sum + d.confidence, 0) / formattedDetections.length
        );
        setAverageConfidence(avgConfidence);
      } else {
        setAverageConfidence(0);
      }

      // رسم النتائج على الـ Canvas
      drawDetections(formattedDetections);

      animationIdRef.current = requestAnimationFrame(detectObjects);
    } catch (err) {
      console.error("خطأ في الكشف:", err);
      animationIdRef.current = requestAnimationFrame(detectObjects);
    }
  };

  // رسم الأشياء المكتشفة
  const drawDetections = (predictions: Detection[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // تحديد حجم الـ Canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // رسم الفيديو
    ctx.drawImage(video, 0, 0);

    // رسم الأشياء المكتشفة
    predictions.forEach((detection) => {
      const [x, y, width, height] = detection.bbox;

      // رسم المربع
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // رسم النص
      const label = `${detection.label} (${detection.confidence}%)`;
      const textWidth = ctx.measureText(label).width;
      const textHeight = 20;

      ctx.fillStyle = "#00ff00";
      ctx.fillRect(x, y - textHeight, textWidth + 10, textHeight);

      ctx.fillStyle = "#000000";
      ctx.font = "16px Arial";
      ctx.fillText(label, x + 5, y - 5);
    });
  };

  // التقاط صورة وحفظ النتائج
  const captureAndSave = async () => {
    if (!canvasRef.current || detections.length === 0 || !user) return;

    try {
      const imageData = canvasRef.current.toDataURL("image/jpeg");

      // حفظ النتائج في قاعدة البيانات
      await saveDetectionMutation.mutateAsync({
        detectionData: detections,
        imageUrl: imageData,
        confidence: averageConfidence,
      });

      // تحديث قائمة الكشوفات
      listDetectionsQuery.refetch();

      // إظهار رسالة نجاح
      alert("تم حفظ النتائج بنجاح!");
    } catch (err) {
      console.error("خطأ في حفظ النتائج:", err);
      alert("فشل حفظ النتائج");
    }
  };

  // حذف جميع الكشوفات
  const clearHistory = async () => {
    if (confirm("هل تريد حذف جميع السجلات؟")) {
      listDetectionsQuery.refetch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* العنوان */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">تطبيق التعرف على الأشياء</h1>
          <p className="text-gray-600">استخدم كاميرا الويب للتعرف على الأشياء بفضل TensorFlow.js</p>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* منطقة الفيديو والـ Canvas */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  عرض الكاميرا
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative bg-black aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover hidden"
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full object-cover"
                  />
                  {!isCameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-white mx-auto mb-4 opacity-50" />
                        <p className="text-white text-lg">اضغط على "تشغيل الكاميرا" للبدء</p>
                      </div>
                    </div>
                  )}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-white">جاري تحميل النموذج...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* أزرار التحكم */}
            <div className="flex gap-3 mt-6">
              {!isCameraActive ? (
                <Button
                  onClick={startCamera}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  تشغيل الكاميرا
                </Button>
              ) : (
                <Button
                  onClick={stopCamera}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  <Square className="w-4 h-4 mr-2" />
                  إيقاف الكاميرا
                </Button>
              )}

              <Button
                onClick={captureAndSave}
                disabled={detections.length === 0 || !user}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                حفظ النتائج
              </Button>
            </div>
          </div>

          {/* لوحة المعلومات */}
          <div className="space-y-6">
            {/* إحصائيات الكشف */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <CardTitle>إحصائيات الكشف</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">عدد الأشياء المكتشفة</p>
                    <p className="text-3xl font-bold text-blue-600">{detections.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">متوسط الثقة</p>
                    <p className="text-3xl font-bold text-indigo-600">{averageConfidence}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* قائمة الأشياء المكتشفة */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="text-lg">الأشياء المكتشفة</CardTitle>
                <CardDescription className="text-purple-100">
                  {detections.length > 0 ? "الكشوفات الحالية" : "لا توجد كشوفات"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {detections.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {detections.map((detection, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200"
                      >
                        <span className="font-medium text-gray-800">{detection.label}</span>
                        <span className="text-sm font-bold text-green-600">{detection.confidence}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">لا توجد كشوفات حالياً</p>
                )}
              </CardContent>
            </Card>

            {/* السجل */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
                <CardTitle className="text-lg">السجل</CardTitle>
                <CardDescription className="text-pink-100">
                  {listDetectionsQuery.data?.length || 0} كشف محفوظ
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {listDetectionsQuery.data && listDetectionsQuery.data.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {listDetectionsQuery.data.map((detection, index) => (
                      <div
                        key={index}
                        className="p-2 bg-gray-50 rounded border border-gray-200 text-sm"
                      >
                        <p className="font-medium text-gray-800">
                          {detection.detectionData.length} أشياء
                        </p>
                        <p className="text-gray-600 text-xs">
                          {new Date(detection.createdAt).toLocaleString("ar-SA")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">لا توجد سجلات محفوظة</p>
                )}
                {listDetectionsQuery.data && listDetectionsQuery.data.length > 0 && (
                  <Button
                    onClick={clearHistory}
                    variant="outline"
                    className="w-full mt-4 text-red-600 border-red-200 hover:bg-red-50"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    حذف السجل
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
