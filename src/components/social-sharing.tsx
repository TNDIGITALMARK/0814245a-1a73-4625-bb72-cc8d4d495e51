"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Instagram, 
  MessageCircle,
  Link2,
  Check,
  Trophy,
  Star
} from "lucide-react";

interface SocialSharingProps {
  type: "game" | "score" | "achievement";
  data: {
    title: string;
    description: string;
    url: string;
    imageUrl?: string;
    score?: number;
    gameTitle?: string;
    achievementTitle?: string;
    achievementIcon?: string;
  };
}

export function SocialSharing({ type, data }: SocialSharingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    switch (type) {
      case "game":
        return `🎮 Check out ${data.title} on GameHub! ${data.description} Play now: ${data.url}`;
      case "score":
        return `🏆 I just scored ${data.score?.toLocaleString()} points in ${data.gameTitle} on GameHub! Can you beat my high score? ${data.url}`;
      case "achievement":
        return `🎯 Achievement Unlocked: "${data.achievementTitle}"! ${data.achievementIcon} Playing ${data.gameTitle} on GameHub! ${data.url}`;
      default:
        return `🎮 Check out GameHub - the ultimate mini-games platform! ${data.url}`;
    }
  };

  const shareText = generateShareText();
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(data.url);

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(data.title)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  const getShareIcon = () => {
    switch (type) {
      case "score":
        return <Trophy className="h-4 w-4" />;
      case "achievement":
        return <Star className="h-4 w-4" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };

  const getShareLabel = () => {
    switch (type) {
      case "score":
        return "Share Score";
      case "achievement":
        return "Share Achievement";
      default:
        return "Share";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="share-button">
          {getShareIcon()}
          <span className="ml-1">{getShareLabel()}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getShareIcon()}
            {getShareLabel()}
          </DialogTitle>
          <DialogDescription>
            Share your gaming {type === "game" ? "discovery" : type} with friends!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Share Preview */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                {data.imageUrl && (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {type === "achievement" ? (
                      <span className="text-2xl">{data.achievementIcon}</span>
                    ) : (
                      <div className="w-12 h-12 bg-primary/30 rounded flex items-center justify-center">
                        🎮
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{data.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {shareText}
                  </p>
                  {type === "score" && data.score && (
                    <Badge variant="secondary" className="mt-2">
                      Score: {data.score.toLocaleString()}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Platform Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleShare("twitter")}
              className="justify-start gap-3"
            >
              <Twitter className="h-4 w-4 text-blue-500" />
              Twitter
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShare("facebook")}
              className="justify-start gap-3"
            >
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShare("whatsapp")}
              className="justify-start gap-3"
            >
              <MessageCircle className="h-4 w-4 text-green-500" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShare("telegram")}
              className="justify-start gap-3"
            >
              <MessageCircle className="h-4 w-4 text-blue-500" />
              Telegram
            </Button>
          </div>

          {/* Copy Link */}
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={data.url}
              className="flex-1"
            />
            <Button
              variant={copied ? "default" : "outline"}
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Additional Sharing Options */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">More platforms:</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare("reddit")}
                className="text-xs"
              >
                Reddit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare("linkedin")}
                className="text-xs"
              >
                LinkedIn
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick Share Button Component
export function QuickShareButton({ 
  platform, 
  url, 
  text, 
  className 
}: {
  platform: "twitter" | "facebook" | "whatsapp";
  url: string;
  text: string;
  className?: string;
}) {
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`
  };

  const icons = {
    twitter: <Twitter className="h-4 w-4" />,
    facebook: <Facebook className="h-4 w-4" />,
    whatsapp: <MessageCircle className="h-4 w-4" />
  };

  const colors = {
    twitter: "text-blue-500 hover:bg-blue-500/10",
    facebook: "text-blue-600 hover:bg-blue-600/10", 
    whatsapp: "text-green-500 hover:bg-green-500/10"
  };

  const handleClick = () => {
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`${colors[platform]} ${className}`}
    >
      {icons[platform]}
    </Button>
  );
}

// Achievement Share Toast Component
export function AchievementShareToast({
  achievement,
  gameTitle,
  onShare
}: {
  achievement: { title: string; icon: string; rarity: string };
  gameTitle: string;
  onShare: () => void;
}) {
  return (
    <div className="achievement-unlock bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{achievement.icon}</div>
        <div className="flex-1">
          <p className="font-bold text-sm">Achievement Unlocked!</p>
          <p className="text-sm opacity-90">{achievement.title}</p>
          <Badge variant="secondary" className="text-xs mt-1">
            {achievement.rarity}
          </Badge>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onShare}
          className="share-button"
        >
          <Share2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}