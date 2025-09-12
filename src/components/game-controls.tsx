import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GameControls as GameControlsType } from "@/lib/types";
import { Keyboard, Mouse, Smartphone } from "lucide-react";

interface GameControlsProps {
  controls: GameControlsType;
}

export function GameControls({ controls }: GameControlsProps) {
  return (
    <div className="space-y-4">
      {/* Keyboard Controls */}
      {controls.keyboard && controls.keyboard.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Keyboard className="w-4 h-4" />
            Keyboard Controls
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {controls.keyboard.map((control, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="font-mono text-xs">
                  {control.key}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {control.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mouse Controls */}
      {controls.mouse && controls.mouse.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Mouse className="w-4 h-4" />
            Mouse Controls
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {controls.mouse.map((control, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="text-xs">
                  {control.input}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {control.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Touch Controls */}
      {controls.touch && controls.touch.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Smartphone className="w-4 h-4" />
            Touch Controls
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {controls.touch.map((control, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="text-xs">
                  {control.gesture}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {control.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No controls defined */}
      {(!controls.keyboard || controls.keyboard.length === 0) &&
       (!controls.mouse || controls.mouse.length === 0) &&
       (!controls.touch || controls.touch.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          <Keyboard className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No specific controls defined for this game.</p>
          <p className="text-sm">Follow the on-screen instructions to play.</p>
        </div>
      )}
    </div>
  );
}