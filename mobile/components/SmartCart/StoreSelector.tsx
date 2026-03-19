import React, { useState } from 'react';
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NearbyStore, StoreType } from '../../types/smartCart';

const TEAL     = '#2BB6A6';
const WW_GREEN = '#007837';
const COLES_RED = '#E31837';
const WHITE    = '#FFFFFF';
const BG       = '#EEF4FA';
const BORDER   = '#E5E7EB';
const TEXT     = '#1C1C1E';
const MUTED    = '#9CA3AF';

function storeColor(store: StoreType): string {
  return store === 'woolworths' ? WW_GREEN : COLES_RED;
}

function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

function SkeletonRow() {
  return (
    <View style={ss.skeletonRow}>
      <Text style={ss.locationPin}>📍</Text>
      <View style={{ gap: 8, flex: 1 }}>
        <View style={[ss.skeleton, { width: '65%' }]} />
        <View style={[ss.skeleton, { width: '45%' }]} />
      </View>
    </View>
  );
}

interface Props {
  nearbyStores: NearbyStore[];
  selectedNearbyStore: NearbyStore | null;
  onSelectStore: (store: NearbyStore) => void;
  locationLoading: boolean;
  locationPermissionDenied: boolean;
  suburb?: string | null;
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

  if (locationLoading) {
    return (
      <>
        <Text style={ss.cardLabel}>SHOP AT</Text>
        <SkeletonRow />
        <Text style={ss.locatingText}>📍 Locating you...</Text>
      </>
    );
  }

  if (nearbyStores.length === 0) {
    return (
      <TouchableOpacity
        style={ss.enableBtn}
        onPress={() => Linking.openURL('app-settings:').catch(() => {})}
        activeOpacity={0.8}
      >
        <Text style={ss.enableTxt}>📍 Enable location to see nearby stores →</Text>
      </TouchableOpacity>
    );
  }

  const color = selectedNearbyStore ? storeColor(selectedNearbyStore.store) : TEAL;

  return (
    <>
      <Text style={ss.cardLabel}>SHOP AT</Text>

      {/* Dropdown trigger */}
      <TouchableOpacity
        style={[ss.dropdown, { borderColor: color }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={[ss.dot, { backgroundColor: color }]} />
        <View style={{ flex: 1 }}>
          <Text style={[ss.dropName, { color }]} numberOfLines={1}>
            {selectedNearbyStore ? selectedNearbyStore.name : 'Select a store'}
          </Text>
          {selectedNearbyStore ? (
            <Text style={ss.dropAddress} numberOfLines={1}>
              {selectedNearbyStore.address}
            </Text>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {selectedNearbyStore ? (
            <Text style={ss.dropDist}>{formatDistance(selectedNearbyStore.distance)}</Text>
          ) : null}
          <Text style={ss.chevron}>⌄</Text>
        </View>
      </TouchableOpacity>

      {suburb ? (
        <Text style={ss.suburbText}>📍 {suburb}</Text>
      ) : locationPermissionDenied ? (
        <Text style={ss.suburbText}>📍 Sydney area (enable location for accuracy)</Text>
      ) : null}

      {/* Store picker modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={ss.overlay}>
          <View style={ss.sheet}>
            <View style={ss.handle} />
            <View style={ss.sheetHeader}>
              <Text style={ss.sheetTitle}>Choose a store</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={ss.closeBtn}
                activeOpacity={0.7}
              >
                <Text style={ss.closeTxt}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {nearbyStores.map((store, idx) => {
                const isSelected = selectedNearbyStore?.id === store.id;
                const sc = storeColor(store.store);
                return (
                  <React.Fragment key={store.id}>
                    {idx > 0 && <View style={ss.divider} />}
                    <TouchableOpacity
                      style={ss.storeRow}
                      onPress={() => { onSelectStore(store); setModalVisible(false); }}
                      activeOpacity={0.7}
                    >
                      <View style={[ss.avatar, { backgroundColor: sc }]}>
                        <Text style={ss.avatarTxt}>
                          {store.store === 'woolworths' ? 'W' : 'C'}
                        </Text>
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={ss.storeRowName} numberOfLines={1}>{store.name}</Text>
                        <Text style={ss.storeRowAddr} numberOfLines={1}>{store.address}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={ss.storeRowDist}>{formatDistance(store.distance)} away</Text>
                          <Text style={{ color: store.isOpen ? '#10B981' : '#EF4444', fontSize: 11, fontWeight: '600' }}>
                            · {store.isOpen ? 'Open now' : 'Closed'}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Text style={ss.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  </React.Fragment>
                );
              })}

              {locationPermissionDenied && (
                <View style={ss.locationBanner}>
                  <Text style={ss.locationBannerTxt}>
                    📍 Allow location access for accurate results
                  </Text>
                  <TouchableOpacity
                    onPress={() => Linking.openURL('app-settings:').catch(() => {})}
                    activeOpacity={0.8}
                  >
                    <Text style={ss.locationBannerBtn}>Enable Location</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const ss = StyleSheet.create({
  cardLabel: {
    fontSize: 11, fontWeight: '700', color: MUTED,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },

  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationPin: { fontSize: 16 },
  skeleton: { height: 11, backgroundColor: '#E5E7EB', borderRadius: 6 },

  enableBtn: {
    backgroundColor: BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  enableTxt: { fontSize: 13, fontWeight: '600', color: MUTED },

  dropdown: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: BG,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dropName: { fontSize: 14, fontWeight: '700' },
  dropAddress: { fontSize: 11, fontWeight: '400', color: MUTED, marginTop: 2 },
  dropDist: { fontSize: 12, fontWeight: '500', color: MUTED },
  chevron: { fontSize: 16, color: MUTED },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, maxHeight: '75%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1, shadowRadius: 16,
  },
  handle: {
    width: 40, height: 4, backgroundColor: BORDER, borderRadius: 2,
    alignSelf: 'center', marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: TEXT },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: BG,
    alignItems: 'center', justifyContent: 'center',
  },
  closeTxt: { fontSize: 13, fontWeight: '700', color: MUTED },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: BORDER, marginHorizontal: 2 },

  storeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 4, paddingVertical: 14,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { color: WHITE, fontSize: 17, fontWeight: '800' },
  storeRowName: { fontSize: 14, fontWeight: '700', color: TEXT },
  storeRowAddr: { fontSize: 11, fontWeight: '400', color: MUTED },
  storeRowDist: { fontSize: 11, fontWeight: '500', color: MUTED },
  checkmark: { fontSize: 18, fontWeight: '700', color: TEAL },

  locationBanner: {
    marginTop: 16, marginHorizontal: 4,
    backgroundColor: 'rgba(43,182,166,0.07)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(43,182,166,0.2)',
    padding: 14, gap: 8,
  },
  locationBannerTxt: { fontSize: 12, fontWeight: '500', color: TEXT },
  locationBannerBtn: { fontSize: 13, fontWeight: '700', color: TEAL },

  locatingText: { fontSize: 12, fontWeight: '500', color: MUTED, marginTop: 4 },
  suburbText: { fontSize: 12, fontWeight: '500', color: MUTED, marginTop: 4 },
});
