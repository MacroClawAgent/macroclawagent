import React, { useState } from 'react';
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NearbyStore, StoreType } from '../../types/smartCart';

const BG      = '#1C1612';
const CARD    = '#252018';
const BORDER  = 'rgba(248,213,97,0.08)';
const GOLD    = '#F5C842';
const CORAL   = '#E07B54';
const SAGE    = '#8B9E6E';
const TEXT_C  = '#E8E0D0';
const MUTED   = 'rgba(232,224,208,0.5)';
const DIM     = 'rgba(232,224,208,0.3)';
const WW_GREEN = '#007837';
const COLES_RED = '#E31837';

function storeColor(store: StoreType): string {
  return store === 'woolworths' ? WW_GREEN : COLES_RED;
}

function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

interface Props {
  nearbyStores: NearbyStore[];
  selectedNearbyStore: NearbyStore | null;
  onSelectStore: (store: NearbyStore) => void;
  locationLoading: boolean;
  locationPermissionDenied: boolean;
  suburb?: string | null;
  onSearchLocation?: (query: string) => void;
}

export function StoreSelector({
  nearbyStores,
  selectedNearbyStore,
  onSelectStore,
  locationLoading,
  locationPermissionDenied,
  suburb,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  // ── Loading state ──
  if (locationLoading) {
    return (
      <View style={ss.section}>
        <View style={ss.loadingRow}>
          <Ionicons name="location-outline" size={18} color={GOLD} />
          <Text style={ss.loadingText}>Finding nearby stores...</Text>
        </View>
      </View>
    );
  }

  // ── No location / permission denied ──
  if (nearbyStores.length === 0) {
    return (
      <View style={ss.section}>
        <TouchableOpacity
          style={ss.enableBtn}
          onPress={() => Linking.openURL('app-settings:').catch(() => {})}
          activeOpacity={0.8}
        >
          <Ionicons name="location-outline" size={18} color={CORAL} />
          <View style={{ flex: 1 }}>
            <Text style={ss.enableTitle}>Enable location</Text>
            <Text style={ss.enableSub}>To find Woolworths and Coles near you</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={DIM} />
        </TouchableOpacity>
      </View>
    );
  }

  // ── Normal: location found, stores available ──
  const color = selectedNearbyStore ? storeColor(selectedNearbyStore.store) : GOLD;

  return (
    <View style={ss.section}>
      {/* Location bar */}
      {suburb && (
        <View style={ss.locationBar}>
          <Ionicons name="location" size={14} color={GOLD} />
          <Text style={ss.locationText}>{suburb}</Text>
        </View>
      )}

      {/* Shop at label */}
      <Text style={ss.shopLabel}>SHOP AT</Text>

      {/* Selected store dropdown */}
      <TouchableOpacity
        style={ss.dropdown}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={[ss.storeDot, { backgroundColor: color }]} />
        <View style={{ flex: 1 }}>
          <Text style={ss.storeName} numberOfLines={1}>
            {selectedNearbyStore ? selectedNearbyStore.name : 'Select a store'}
          </Text>
          {selectedNearbyStore && (
            <Text style={ss.storeAddr} numberOfLines={1}>{selectedNearbyStore.address}</Text>
          )}
        </View>
        {selectedNearbyStore && (
          <Text style={ss.storeDist}>{formatDistance(selectedNearbyStore.distance)}</Text>
        )}
        <Ionicons name="chevron-down" size={16} color={DIM} />
      </TouchableOpacity>

      {/* Store picker modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={ss.overlay} activeOpacity={1} onPress={() => setModalVisible(false)} />
        <View style={ss.sheet}>
          <View style={ss.handle} />
          <View style={ss.sheetHeader}>
            <Text style={ss.sheetTitle}>Stores near you</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={ss.closeBtn} activeOpacity={0.75}>
              <Ionicons name="close" size={16} color={MUTED} />
            </TouchableOpacity>
          </View>

          {suburb && (
            <View style={ss.sheetLocation}>
              <Ionicons name="location" size={14} color={GOLD} />
              <Text style={ss.sheetLocationText}>{suburb}</Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            {nearbyStores.map((store) => {
              const isSelected = selectedNearbyStore?.id === store.id;
              const sc = storeColor(store.store);
              return (
                <TouchableOpacity
                  key={store.id}
                  style={[ss.storeRow, isSelected && ss.storeRowSelected]}
                  onPress={() => { onSelectStore(store); setModalVisible(false); }}
                  activeOpacity={0.75}
                >
                  <View style={[ss.avatar, { backgroundColor: sc }]}>
                    <Text style={ss.avatarText}>
                      {store.store === 'woolworths' ? 'W' : 'C'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={ss.rowName} numberOfLines={1}>{store.name}</Text>
                    <Text style={ss.rowAddr} numberOfLines={1}>{store.address}</Text>
                    <View style={ss.rowMeta}>
                      <Text style={ss.rowDist}>{formatDistance(store.distance)}</Text>
                      <View style={[ss.statusDot, { backgroundColor: store.isOpen ? SAGE : CORAL }]} />
                      <Text style={[ss.rowStatus, { color: store.isOpen ? SAGE : CORAL }]}>
                        {store.isOpen ? 'Open' : 'Closed'}
                      </Text>
                    </View>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={GOLD} />}
                </TouchableOpacity>
              );
            })}

            {locationPermissionDenied && (
              <TouchableOpacity
                style={ss.permBanner}
                onPress={() => Linking.openURL('app-settings:').catch(() => {})}
                activeOpacity={0.8}
              >
                <Ionicons name="location-outline" size={16} color={GOLD} />
                <Text style={ss.permText}>Enable precise location for better results</Text>
              </TouchableOpacity>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const ss = StyleSheet.create({
  section: { gap: 8 },

  // Loading
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  loadingText: { fontSize: 13, color: MUTED },

  // Enable location
  enableBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: BG, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    padding: 16,
  },
  enableTitle: { fontSize: 14, fontWeight: '700', color: TEXT_C },
  enableSub: { fontSize: 12, color: MUTED, marginTop: 2 },

  // Location bar
  locationBar: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  locationText: { fontSize: 13, fontWeight: '600', color: GOLD },

  // Shop at
  shopLabel: { fontSize: 11, fontWeight: '700', color: DIM, letterSpacing: 1, marginTop: 4 },

  // Dropdown
  dropdown: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: BG, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  storeDot: { width: 10, height: 10, borderRadius: 5 },
  storeName: { fontSize: 15, fontWeight: '700', color: TEXT_C },
  storeAddr: { fontSize: 11, color: MUTED, marginTop: 2 },
  storeDist: { fontSize: 12, fontWeight: '600', color: MUTED, marginRight: 4 },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: CARD, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderColor: BORDER,
    padding: 20, maxHeight: '75%',
  },
  handle: { width: 40, height: 4, backgroundColor: DIM, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: TEXT_C },
  closeBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: BG, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  sheetLocation: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  sheetLocationText: { fontSize: 13, fontWeight: '600', color: GOLD },

  // Store rows
  storeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: 'rgba(232,224,208,0.06)',
  },
  storeRowSelected: { backgroundColor: 'rgba(245,200,66,0.04)', borderRadius: 12, marginHorizontal: -4, paddingHorizontal: 8 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  rowName: { fontSize: 14, fontWeight: '700', color: TEXT_C },
  rowAddr: { fontSize: 11, color: MUTED, marginTop: 1 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  rowDist: { fontSize: 11, fontWeight: '600', color: DIM },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  rowStatus: { fontSize: 11, fontWeight: '600' },

  // Permission banner
  permBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(245,200,66,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(245,200,66,0.15)',
    padding: 14, marginTop: 12,
  },
  permText: { fontSize: 12, fontWeight: '600', color: GOLD, flex: 1 },
});
