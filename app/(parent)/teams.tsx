import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Users, Trophy, User } from 'lucide-react-native';
import { useLocalData } from '@/hooks/local-data-context';

interface Kid {
  id: string;
  name: string;
  age?: number;
  team?: string;
  position?: string;
  parentId: string;
}

export default function TeamsScreen() {
  const { getAllKidsForTeams } = useLocalData();
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'all' | 'A' | 'B'>('all');

  const loadKids = async () => {
    try {
      console.log('📋 [TEAMS PAGE] Loading ALL kids for teams page...');
      const data = await getAllKidsForTeams();
      console.log('✅ [TEAMS PAGE] Kids loaded from database:', JSON.stringify(data, null, 2));
      console.log('📊 [TEAMS PAGE] Total kids:', data.length);
      console.log('📊 [TEAMS PAGE] Kids with teams:', data.filter(k => k.team).length);
      console.log('📊 [TEAMS PAGE] Team assignments:', data.map(k => ({ name: k.name, team: k.team, parentId: k.parentId })));
      
      if (data.length === 0) {
        console.warn('⚠️ [TEAMS PAGE] No kids found in database! This might be a data issue.');
      }
      
      setKids(data);
    } catch (error) {
      console.error('❌ [TEAMS PAGE] Error loading kids:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadKids();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadKids();
  };

  const teamAKids = kids.filter(kid => kid.team?.toUpperCase() === 'A');
  const teamBKids = kids.filter(kid => kid.team?.toUpperCase() === 'B');
  const unassignedKids = kids.filter(kid => !kid.team || (kid.team.toUpperCase() !== 'A' && kid.team.toUpperCase() !== 'B'));

  const filteredKids = selectedTeam === 'all' 
    ? kids 
    : selectedTeam === 'A' 
    ? teamAKids 
    : teamBKids;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B5E20" />
        <Text style={styles.loadingText}>Loading teams...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B5E20']} />
      }
    >
      <View style={styles.header}>
        <Trophy size={32} color="#1B5E20" />
        <Text style={styles.headerTitle}>Team Rosters</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedTeam === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedTeam('all')}
        >
          <Text style={[styles.filterButtonText, selectedTeam === 'all' && styles.filterButtonTextActive]}>
            All Teams
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedTeam === 'A' && styles.filterButtonActive]}
          onPress={() => setSelectedTeam('A')}
        >
          <Text style={[styles.filterButtonText, selectedTeam === 'A' && styles.filterButtonTextActive]}>
            Team A
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedTeam === 'B' && styles.filterButtonActive]}
          onPress={() => setSelectedTeam('B')}
        >
          <Text style={[styles.filterButtonText, selectedTeam === 'B' && styles.filterButtonTextActive]}>
            Team B
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{teamAKids.length}</Text>
          <Text style={styles.statLabel}>Team A Players</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{teamBKids.length}</Text>
          <Text style={styles.statLabel}>Team B Players</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{kids.length}</Text>
          <Text style={styles.statLabel}>Total Players</Text>
        </View>
      </View>

      {selectedTeam === 'all' ? (
        <>
          <View style={styles.teamSection}>
            <View style={styles.teamHeader}>
              <View style={[styles.teamBadge, { backgroundColor: '#1976D2' }]}>
                <Text style={styles.teamBadgeText}>A</Text>
              </View>
              <Text style={styles.teamTitle}>Team A</Text>
              <Text style={styles.teamCount}>({teamAKids.length} players)</Text>
            </View>
            {teamAKids.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={40} color="#CCCCCC" />
                <Text style={styles.emptyText}>No players in Team A yet</Text>
              </View>
            ) : (
              <View style={styles.playersList}>
                {teamAKids.map((kid) => (
                  <View key={kid.id} style={styles.playerCard}>
                    <View style={styles.playerIcon}>
                      <User size={20} color="#1B5E20" />
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{kid.name}</Text>
                      <View style={styles.playerDetails}>
                        {kid.age && <Text style={styles.playerDetail}>Age: {kid.age}</Text>}
                        {kid.position && <Text style={styles.playerDetail}>• {kid.position}</Text>}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.teamSection}>
            <View style={styles.teamHeader}>
              <View style={[styles.teamBadge, { backgroundColor: '#D32F2F' }]}>
                <Text style={styles.teamBadgeText}>B</Text>
              </View>
              <Text style={styles.teamTitle}>Team B</Text>
              <Text style={styles.teamCount}>({teamBKids.length} players)</Text>
            </View>
            {teamBKids.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={40} color="#CCCCCC" />
                <Text style={styles.emptyText}>No players in Team B yet</Text>
              </View>
            ) : (
              <View style={styles.playersList}>
                {teamBKids.map((kid) => (
                  <View key={kid.id} style={styles.playerCard}>
                    <View style={styles.playerIcon}>
                      <User size={20} color="#1B5E20" />
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{kid.name}</Text>
                      <View style={styles.playerDetails}>
                        {kid.age && <Text style={styles.playerDetail}>Age: {kid.age}</Text>}
                        {kid.position && <Text style={styles.playerDetail}>• {kid.position}</Text>}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {unassignedKids.length > 0 && (
            <View style={styles.teamSection}>
              <View style={styles.teamHeader}>
                <View style={[styles.teamBadge, { backgroundColor: '#757575' }]}>
                  <Text style={styles.teamBadgeText}>?</Text>
                </View>
                <Text style={styles.teamTitle}>Unassigned</Text>
                <Text style={styles.teamCount}>({unassignedKids.length} players)</Text>
              </View>
              <View style={styles.playersList}>
                {unassignedKids.map((kid) => (
                  <View key={kid.id} style={styles.playerCard}>
                    <View style={styles.playerIcon}>
                      <User size={20} color="#757575" />
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{kid.name}</Text>
                      <View style={styles.playerDetails}>
                        {kid.age && <Text style={styles.playerDetail}>Age: {kid.age}</Text>}
                        {kid.position && <Text style={styles.playerDetail}>• {kid.position}</Text>}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      ) : (
        <View style={styles.teamSection}>
          <View style={styles.teamHeader}>
            <View style={[styles.teamBadge, { backgroundColor: selectedTeam === 'A' ? '#1976D2' : '#D32F2F' }]}>
              <Text style={styles.teamBadgeText}>{selectedTeam}</Text>
            </View>
            <Text style={styles.teamTitle}>Team {selectedTeam}</Text>
            <Text style={styles.teamCount}>({filteredKids.length} players)</Text>
          </View>
          {filteredKids.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={40} color="#CCCCCC" />
              <Text style={styles.emptyText}>No players in Team {selectedTeam} yet</Text>
            </View>
          ) : (
            <View style={styles.playersList}>
              {filteredKids.map((kid) => (
                <View key={kid.id} style={styles.playerCard}>
                  <View style={styles.playerIcon}>
                    <User size={20} color="#1B5E20" />
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{kid.name}</Text>
                    <View style={styles.playerDetails}>
                      {kid.age && <Text style={styles.playerDetail}>Age: {kid.age}</Text>}
                      {kid.position && <Text style={styles.playerDetail}>• {kid.position}</Text>}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B5E20',
    marginLeft: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#1B5E20',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B5E20',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  teamSection: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamBadgeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  teamTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  teamCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  playersList: {
    gap: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1B5E20',
  },
  playerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  playerDetails: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },
  playerDetail: {
    fontSize: 13,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
});
