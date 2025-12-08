
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function ThemeSettings({ preferences }: { preferences: any }) {
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const [primaryColor, setPrimaryColor] = useState(
    preferences?.primary_color || '#000000'
  );
  const [backgroundColor, setBackgroundColor] = useState(
    preferences?.background_color || '#ffffff'
  );
  const [backgroundImage, setBackgroundImage] = useState(
    preferences?.background_image || ''
  );

  const handleUpdateTheme = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('user_preferences')
      .update({
        primary_color: primaryColor,
        background_color: backgroundColor,
        background_image: backgroundImage,
      })
      .eq('user_id', preferences.user_id);

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
  };

  return (
    <form onSubmit={handleUpdateTheme} className="space-y-4">
      <div>
        <Label htmlFor="primaryColor">Primary Color</Label>
        <Input
          id="primaryColor"
          type="color"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="backgroundColor">Background Color</Label>
        <Input
          id="backgroundColor"
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="backgroundImage">Background Image URL</Label>
        <Input
          id="backgroundImage"
          type="text"
          value={backgroundImage}
          onChange={(e) => setBackgroundImage(e.target.value)}
        />
      </div>
      <Button type="submit">Save Theme</Button>
    </form>
  );
}
