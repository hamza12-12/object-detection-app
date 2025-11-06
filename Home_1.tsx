import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { ArrowRight, Zap, Eye, Database, Smartphone } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="w-8 h-8" />}
            <h1 className="text-2xl font-bold text-white">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-purple-300 text-sm">{user?.name || "المستخدم"}</span>
                <Button
                  onClick={() => logout()}
                  variant="outline"
                  className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
                >
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-purple-600 hover:bg-purple-700"
              >
                تسجيل الدخول
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            تطبيق التعرف على <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">الأشياء</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            استخدم قوة الذكاء الاصطناعي والتعلم الآلي للتعرف على الأشياء في الوقت الفعلي باستخدام كاميرا الويب الخاصة بك
          </p>
          {isAuthenticated ? (
            <Button
              onClick={() => setLocation("/detection")}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6"
            >
              ابدأ الآن
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6"
            >
              سجل الدخول للبدء
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-white text-center mb-12">المميزات الرئيسية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">الكشف في الوقت الفعلي</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                اكتشف الأشياء في الوقت الفعلي باستخدام كاميرا الويب مع دقة عالية وسرعة فائقة
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">تقنية TensorFlow.js</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                تعمل بالكامل في المتصفح دون الحاجة لخادم خلفي، مما يضمن الخصوصية والسرعة
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">حفظ النتائج</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                احفظ نتائج الكشف والصور في قاعدة البيانات وراجعها في أي وقت
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">متوافق مع الأجهزة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                يعمل على جميع الأجهزة والمتصفحات الحديثة، سطح المكتب والهاتف الذكي
              </p>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">دقة عالية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                نموذج COCO-SSD يدعم التعرف على أكثر من 90 فئة مختلفة من الأشياء
              </p>
            </CardContent>
          </Card>

          {/* Feature 6 */}
          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">سهل الاستخدام</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                واجهة بسيطة وسهلة الاستخدام لا تتطلب أي معرفة تقنية متقدمة
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">جاهز للبدء؟</h3>
          <p className="text-gray-300 mb-8 text-lg">
            ابدأ باستخدام تطبيق التعرف على الأشياء الآن واكتشف قوة الذكاء الاصطناعي
          </p>
          {isAuthenticated ? (
            <Button
              onClick={() => setLocation("/detection")}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6"
            >
              انتقل إلى التطبيق
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6"
            >
              سجل الدخول الآن
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>© 2025 تطبيق التعرف على الأشياء. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
