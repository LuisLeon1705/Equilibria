
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

export default function ThemeSettings({ preferences }: { preferences: any }) {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const { toast } = useToast();
  const [backgroundType, setBackgroundType] = useState(
    preferences?.background_type || 'color'
  );
  const [backgroundColor, setBackgroundColor] = useState(
    preferences?.background_color || '#ffffff'
  );
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(
    preferences?.background_image_url || ''
  );
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    preferences?.profile_picture_url || ''
  );
  const [stressColorLow, setStressColorLow] = useState(
    preferences?.stress_color_low || '#22c55e'
  );
  const [stressColorMedium, setStressColorMedium] = useState(
    preferences?.stress_color_medium || '#eab308'
  );
  const [stressColorHigh, setStressColorHigh] = useState(
    preferences?.stress_color_high || '#ef4444'
  );
  const [defaultCalendarView, setDefaultCalendarView] = useState(
    preferences?.default_calendar_view || 'week'
  );
  const [stressAlertsEnabled, setStressAlertsEnabled] = useState(
    preferences?.stress_alerts_enabled ?? true
  );
  const [stressAlertThreshold, setStressAlertThreshold] = useState(
    preferences?.stress_alert_threshold || 7
  );


  const handleUpdateTheme = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        toast({
            title: 'Error',
            description: 'You must be logged in to update your theme.',
            variant: 'destructive',
        });
        return;
    }

    const { error } = await supabase
      .from('user_preferences')
      .update({
        background_type: backgroundType,
        background_color: backgroundColor,
        background_image_url: backgroundImageUrl,
        profile_picture_url: profilePictureUrl,
        stress_color_low: stressColorLow,
        stress_color_medium: stressColorMedium,
        stress_color_high: stressColorHigh,
        default_calendar_view: defaultCalendarView,
        stress_alerts_enabled: stressAlertsEnabled,
        stress_alert_threshold: stressAlertThreshold,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error updating theme',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Theme updated',
      description: 'Your theme has been updated successfully.',
    });
    
    router.refresh();
  };


  return (
    <Card className="p-6">
        <form onSubmit={handleUpdateTheme} className="space-y-4">
        <div>
            <Label htmlFor="profilePictureUrl">Profile Picture URL</Label>
            <Input
                id="profilePictureUrl"
                type="text"
                value={profilePictureUrl}
                onChange={(e) => setProfilePictureUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
            />
        </div>
        <div className="flex items-center space-x-2">
            <Label htmlFor="background-type">Use Image Background</Label>
            <Switch
                id="background-type"
                checked={backgroundType === 'image'}
                onCheckedChange={(checked) => setBackgroundType(checked ? 'image' : 'color')}
            />
        </div>

        {backgroundType === 'color' ? (
            <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <Input
                id="backgroundColor"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                />
            </div>
        ) : (
            <div>
                <Label htmlFor="backgroundImage">Background Image URL</Label>
                <Input
                id="backgroundImage"
                type="text"
                value={backgroundImageUrl}
                onChange={(e) => setBackgroundImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                />
            </div>
        )}

        <div>
            <Label htmlFor="stressColorLow">Low Stress Color</Label>
            <Input
            id="stressColorLow"
            type="color"
            value={stressColorLow}
            onChange={(e) => setStressColorLow(e.target.value)}
            />
        </div>
        <div>
            <Label htmlFor="stressColorMedium">Medium Stress Color</Label>
            <Input
            id="stressColorMedium"
            type="color"
            value={stressColorMedium}
            onChange={(e) => setStressColorMedium(e.target.value)}
            />
        </div>
        <div>
            <Label htmlFor="stressColorHigh">High Stress Color</Label>
            <Input
            id="stressColorHigh"
            type="color"
            value={stressColorHigh}
            onChange={(e) => setStressColorHigh(e.target.value)}
            />
        </div>
            <div>
            <Label>Default Calendar View</Label>
            <div className="flex gap-2">
                {(["day", "week", "month", "year"] as const).map((v) => (
                <Button
                    key={v}
                    type="button"
                    variant={defaultCalendarView === v ? 'default' : 'outline'}
                    onClick={() => setDefaultCalendarView(v)}
                >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                </Button>
                ))}
            </div>
            </div>
            <div className="flex items-center space-x-2">
            <Switch
                id="stress-alerts"
                checked={stressAlertsEnabled}
                onCheckedChange={setStressAlertsEnabled}
            />
            <Label htmlFor="stress-alerts">Enable stress alerts</Label>
            </div>
            <div>
            <Label>Stress Alert Threshold</Label>
            <div className="flex items-center gap-4">
                <Slider
                min={1}
                max={10}
                step={1}
                value={[stressAlertThreshold]}
                onValueChange={(value) => setStressAlertThreshold(value[0])}
                />
                <span>{stressAlertThreshold}</span>
            </div>
            </div>
        <Button type="submit">Save Theme</Button>
        </form>
    </Card>
  );
}
