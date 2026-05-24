"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Music2, Zap, Users, Star, Instagram, MessageCircle, Phone, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useUser } from "@/firebase";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/context/TranslationContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FEATURES = [
  { title: "Elite Sound", icon: Music2, desc: "High-end systems for crystal clear audio." },
  { title: "Intelligent FX", icon: Zap, desc: "Lighting synced to every beat transition." },
  { title: "Crowd Reading", icon: Users, desc: "Adapting genres to keep the dancefloor alive." },
  { title: "100% Reliable", icon: ShieldCheck, desc: "No delays. Your event is our priority." },
];

const DEFAULT_REVIEWS = [
  { name: "Arjun & Priya", comment: "DJ Sanjay made our wedding unforgettable. The transition was seamless!", stars: 5, avatarUrl: "https://picsum.photos/seed/review1/100/100" },
  { name: "Tech Corp Inc.", comment: "Best corporate party we've ever had. Professional and high energy.", stars: 5, avatarUrl: "https://picsum.photos/seed/review2/100/100" },
  { name: "Vijay S.", comment: "The Gold package lighting is absolutely insane. Highly recommended!", stars: 5, avatarUrl: "https://picsum.photos/seed/review3/100/100" },
];

export default function Home() {
  const { user } = useUser();
  const { language, t } = useTranslation();

  // Reviews states
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  
  // New review form states
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("*");

      if (error) throw error;

      const normalizedReviews = (data || []).sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt ?? a.created_at ?? 0).getTime();
        const bTime = new Date(b.createdAt ?? b.created_at ?? 0).getTime();
        return bTime - aTime;
      });

      setDbReviews(normalizedReviews);
    } catch {
      setDbReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Pre-fill reviewer name if logged in
  useEffect(() => {
    if (user?.displayName) {
      setReviewerName(user.displayName);
    }
  }, [user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !comment) return;

    try {
      setSubmittingReview(true);
      const { error } = await supabase.from("reviews").insert([
        {
          name: reviewerName,
          stars: rating,
          comment: comment
        }
      ]);

      if (error) throw error;

      setSubmitSuccess(true);
      setComment("");
      setRating(5);
      
      // Refresh list
      await fetchReviews();

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowAddReview(false);
      }, 2000);
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Combine DB reviews with placeholders to make a rich slide carousel
  const allReviews = [...dbReviews, ...DEFAULT_REVIEWS];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[url('/DJ_SANJAY_BGREMOVED.png')] bg-cover bg-center bg-fixed opacity-15 pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="z-10 max-w-3xl space-y-6">
          <h1 className="text-4xl md:text-5xl font-headline font-bold leading-tight tracking-tighter text-white">
            {t('THE BEAT STARTS')} <br/><span className="text-primary uppercase">{t('RIGHT HERE.')}</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-medium">
            {t('DJ SANJAY: Premium Experience for Weddings and Corporate Events in Chennai.')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild className="w-full sm:w-auto bg-primary text-black font-bold h-11 px-8 rounded-full text-sm">
              <Link href="/booking">{t('BOOK DJ SHOW')}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto border-white/10 hover:bg-white/5 h-11 px-8 rounded-full text-sm">
              <Link href="/packages">{t('VIEW PACKAGES')}</Link>
            </Button>
          </div>

          {/* Admin Dashboard Button below "View Packages" if signed in with admin email */}
          {user?.email === "admin@djsanjay.com" && (
            <div className="pt-2">
              <Button asChild className="bg-secondary text-white font-bold h-10 px-8 rounded-full text-xs shadow-lg hover:bg-secondary/90 transition-all border border-secondary/30">
                <Link href="/admin-djsanjay-secret-login">{t('Admin Dashboard')}</Link>
              </Button>
            </div>
          )}

          <div className="flex justify-center gap-10 pt-4">
            <div className="text-center">
              <div className="text-3xl font-headline font-bold text-secondary">14</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">{t('Booked')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-headline font-bold text-primary">13</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">{t('Completed')}</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 max-w-5xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-950/40 p-6 md:p-10">
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.5)), url('/DJ_SANJAY_BGREMOVED.png'), url('/DJ_SANJAY_BGREMOVED.png')`,
              backgroundPosition: 'center, center, center',
              backgroundSize: 'cover, cover, cover',
              backgroundAttachment: 'fixed, scroll, scroll',
            }}
          />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-3xl font-headline font-bold text-white">
                {language === 'ta' ? 'ஏன் ' : 'Why '} 
                <span className="text-primary">DJ SANJAY</span>
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {t('Professionalism meets high-energy performance. With over a decade of experience, we specialize in seamless genre transitions.')}
              </p>
              <div className="pt-2">
                <Button asChild size="sm" className="bg-secondary text-white font-bold h-10 px-6 rounded-full text-xs">
                  <Link href="/booking">{t('Start Your Booking')}</Link>
                </Button>
              </div>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURES.map((f, i) => (
                <div key={i} className="bg-zinc-900/60 p-5 rounded-xl border border-white/5 professional-shadow">
                  <f.icon className="text-primary mb-3" size={24} />
                  <h4 className="text-base font-bold mb-1 text-white">{t(f.title)}</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{t(f.desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container mx-auto px-4 max-w-5xl space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl md:text-3xl font-headline font-bold text-white">{t('Reviews')}</h2>
          <p className="text-zinc-500 text-xs">{t('Verified stories from the hottest dancefloors')}</p>
        </div>

        <div className="flex justify-center mb-6">
          <Button 
            onClick={() => setShowAddReview(!showAddReview)} 
            className="bg-primary text-black font-bold h-10 px-6 rounded-full text-xs flex items-center gap-2 shadow-lg"
          >
            <Sparkles size={14} />
            {t('Add Review')}
          </Button>
        </div>

        {/* Add Review Panel */}
        <AnimatePresence>
          {showAddReview && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden max-w-lg mx-auto"
            >
              <div className="bg-zinc-950/50 border border-white/5 rounded-3xl p-6 mb-8 backdrop-blur-md professional-shadow space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary text-center">
                  Share Your Experience
                </h3>
                
                {submitSuccess ? (
                  <div className="text-center text-xs text-primary font-bold py-4">
                    Review submitted successfully! Thank you.
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="rev-name" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {t('Your Name')}
                      </Label>
                      <Input 
                        id="rev-name"
                        required
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="e.g. Rahul K."
                        className="h-10 bg-black/60 border-zinc-900 text-xs rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
                        {t('Star Rating')}
                      </Label>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="text-zinc-600 hover:text-primary transition-colors focus:outline-none"
                          >
                            <Star 
                              size={20} 
                              fill={(hoverRating !== null ? star <= hoverRating : star <= rating) ? "currentColor" : "none"}
                              className={(hoverRating !== null ? star <= hoverRating : star <= rating) ? "text-primary" : "text-zinc-600"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="rev-comment" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Comments
                      </Label>
                      <textarea
                        id="rev-comment"
                        required
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t('Write a comment...')}
                        className="w-full bg-black/60 border border-zinc-900 focus:border-primary/50 text-xs rounded-xl p-3 text-white placeholder-zinc-600 focus:outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={submittingReview}
                        className="flex-1 bg-primary text-black font-bold h-10 rounded-xl text-xs"
                      >
                        {submittingReview ? <Loader2 className="animate-spin text-black" size={16} /> : t('Submit Review')}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowAddReview(false)}
                        variant="outline"
                        className="border-zinc-900 text-zinc-400 h-10 rounded-xl text-xs hover:bg-white/5"
                      >
                        {t('Cancel')}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {reviewsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : (
          <Carousel className="w-full" plugins={[Autoplay({ delay: 3000, stopOnInteraction: true })]}>
            <CarouselContent>
              {allReviews.map((review, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3 p-2">
                  <Card className="bg-zinc-900/30 border-white/5 h-full rounded-2xl professional-shadow">
                    <CardContent className="pt-6 flex flex-col items-center text-center px-5">
                      <div className="w-12 h-12 rounded-full overflow-hidden mb-4 border border-primary/20 bg-zinc-950 flex items-center justify-center">
                        {review.avatarUrl ? (
                          <img src={review.avatarUrl} alt={review.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={20} className="text-zinc-600" />
                        )}
                      </div>
                      <div className="flex mb-3 text-primary gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={10} fill={j < review.stars ? "currentColor" : "none"} className={j < review.stars ? "text-primary" : "text-zinc-800"} />
                        ))}
                      </div>
                      <p className="text-zinc-400 text-[11px] italic leading-relaxed font-medium">"{review.comment}"</p>
                      <h4 className="mt-3 font-bold text-white text-sm">{review.name}</h4>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </section>

      {/* Footer Socials */}
      <footer className="border-t border-white/5 py-10 text-center">
        <div className="container mx-auto px-4 max-w-xl space-y-6">
          <div className="flex justify-center gap-4">
            <Link href="tel:9962205244" className="w-10 h-10 rounded-full glass flex items-center justify-center text-primary hover:scale-105 transition-transform">
              <Phone size={18} />
            </Link>
            <Link href="https://wa.me/9962205244" target="_blank" className="w-10 h-10 rounded-full glass flex items-center justify-center text-primary hover:scale-105 transition-transform">
              <MessageCircle size={18} />
            </Link>
            <Link href="https://instagram.com/dj_sharky_official" target="_blank" className="w-10 h-10 rounded-full glass flex items-center justify-center text-primary hover:scale-105 transition-transform">
              <Instagram size={18} />
            </Link>
          </div>
          <div className="space-y-1">
            <p className="text-zinc-600 text-[9px] tracking-[0.2em] uppercase font-bold">© 2024 DJ SANJAY ENTERTAINMENT</p>
            <p className="text-[7px] text-zinc-700 font-bold uppercase tracking-widest">Premium Audio Engineering & Live Performance</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
