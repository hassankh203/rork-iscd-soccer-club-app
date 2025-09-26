import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useMemo } from 'react';
import { hadiths } from '@/constants/hadiths';

interface HadithState {
  getHadithOfTheDay: () => Promise<typeof hadiths[0]>;
}

interface HadithHistoryEntry {
  id: number;
  date: string;
}

export const [HadithProvider, useHadith] = createContextHook<HadithState>(() => {
  const getHadithOfTheDay = useCallback(async (): Promise<typeof hadiths[0]> => {
    try {
      console.log('Getting Hadith of the Day with 30-day distinctness...');
      
      // Get the last 30 days of shown hadiths
      const hadithHistoryData = await AsyncStorage.getItem('hadithHistory');
      const hadithHistory: HadithHistoryEntry[] = hadithHistoryData ? JSON.parse(hadithHistoryData) : [];
      
      // Remove entries older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentHistory = hadithHistory.filter(entry => new Date(entry.date) > thirtyDaysAgo);
      
      // Get IDs of hadiths shown in the last 30 days
      const recentHadithIds = recentHistory.map(entry => entry.id);
      
      // Filter available hadiths (exclude recently shown ones)
      const availableHadiths = hadiths.filter(hadith => !recentHadithIds.includes(hadith.id));
      
      // If all hadiths have been shown in the last 30 days, reset and use all hadiths
      const hadithsToChooseFrom = availableHadiths.length > 0 ? availableHadiths : hadiths;
      
      // Select a random hadith from available ones
      const randomHadith = hadithsToChooseFrom[Math.floor(Math.random() * hadithsToChooseFrom.length)];
      
      // Add this hadith to history
      const newHistoryEntry: HadithHistoryEntry = {
        id: randomHadith.id,
        date: new Date().toISOString()
      };
      
      const updatedHistory = [...recentHistory, newHistoryEntry];
      await AsyncStorage.setItem('hadithHistory', JSON.stringify(updatedHistory));
      
      console.log(`Selected hadith ${randomHadith.id}. Available: ${hadithsToChooseFrom.length}/${hadiths.length}`);
      
      return randomHadith;
    } catch (error) {
      console.error('Error managing hadith history:', error);
      // Fallback to random selection if there's an error
      const randomHadith = hadiths[Math.floor(Math.random() * hadiths.length)];
      console.log(`Fallback: Selected random hadith ${randomHadith.id}`);
      return randomHadith;
    }
  }, []);

  return useMemo(() => ({
    getHadithOfTheDay
  }), [getHadithOfTheDay]);
});