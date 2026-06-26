import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { seriesApi } from '../services/api';
import MangaCard from './cards/MangaCard';
import colors from '../theme/colors';

// export default function RecentlyViewedCarousel({ onSeriesPress }) {
//   const { items: recentItems } = useRecentlyViewed();

//   const { data: latestData } = useQuery({
//     queryKey: ['series', 'latest', 'carousel'],
//     queryFn: () => seriesApi.getLatest({ limit: 10 }),
//     enabled: recentItems.length === 0,
//   });

//   const displayItems = recentItems.length > 0 ? recentItems : latestData?.data || [];
//   const title = recentItems.length > 0 ? 'Recently Viewed' : 'Recently Updated';

//   if (displayItems.length === 0) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>{title}</Text>
//         <Text style={styles.emptyText}>Nothing here yet. Browse to discover series.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{title}</Text>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
//         {displayItems.map((item) => (
//           <View key={item.slug ?? item.id} style={styles.carouselItem}>
//             <MangaCard
//               series={item}
//               section="recently_viewed"
//               onPress={onSeriesPress}
//               style={{ margin: 0, width: 140, height: 300 }}
//             />
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// }

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.navy,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: colors.muted,
  },
  carousel: {
    paddingBottom: 4,
    gap: 12,
  },
  carouselItem: {
    width: 140,
    height: 300,
  },
});
