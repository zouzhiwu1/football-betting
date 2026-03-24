import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { curveImageUrl, fetchCurveDates, searchCurves, type CurveItem } from '@/api/curves';
import { useAuth } from '@/context/AuthContext';
import { UI } from '@/constants/ui';

export default function CurvesScreen() {
  const { token } = useAuth();
  const [date, setDate] = useState('');
  const [team, setTeam] = useState('');
  const [dates, setDates] = useState<string[]>([]);
  const [items, setItems] = useState<CurveItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingDates, setLoadingDates] = useState(true);

  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setDate(`${y}${m}${d}`);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { ok, data } = await fetchCurveDates();
        if (ok && data.dates?.length) setDates(data.dates);
      } catch {
        /* ignore */
      } finally {
        setLoadingDates(false);
      }
    })();
  }, []);

  const onSearch = async () => {
    if (!token) {
      Alert.alert('提示', '请先登录');
      return;
    }
    const d = date.trim();
    if (!/^\d{8}$/.test(d)) {
      Alert.alert('提示', '日期须为 YYYYMMDD');
      return;
    }
    if (!team.trim()) {
      Alert.alert('提示', '请输入主队或客队名称关键词');
      return;
    }
    setSearching(true);
    setItems([]);
    try {
      const { ok, status, data } = await searchCurves(token, d, team);
      if (status === 401) {
        Alert.alert('提示', data.message || '登录已失效，请重新登录');
        return;
      }
      if (data.error) {
        Alert.alert('查询失败', data.error);
        return;
      }
      if (data.member_only && data.message) {
        Alert.alert('提示', data.message);
      }
      const list = data.items || [];
      setItems(list);
      if (list.length === 0 && !data.member_only) {
        Alert.alert('提示', '该条件下没有可展示的曲线图');
      }
    } catch {
      Alert.alert('网络错误', '请检查网络与 API 地址');
    } finally {
      setSearching(false);
    }
  };

  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.form}>
          <Text style={styles.label}>日期 YYYYMMDD</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            keyboardType="number-pad"
            maxLength={8}
            placeholderTextColor={UI.muted}
          />
          {!loadingDates && dates.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
              {dates.slice(0, 12).map((dt) => (
                <TouchableOpacity key={dt} style={styles.chip} onPress={() => setDate(dt)}>
                  <Text style={styles.chipText}>{dt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={styles.label}>球队名（主或客，模糊匹配）</Text>
          <TextInput
            style={styles.input}
            value={team}
            onChangeText={setTeam}
            placeholderTextColor={UI.muted}
          />

          <TouchableOpacity
            style={[styles.btn, searching && styles.btnDisabled]}
            onPress={onSearch}
            disabled={searching}>
            {searching ? (
              <ActivityIndicator color="#022c22" />
            ) : (
              <Text style={styles.btnText}>搜索</Text>
            )}
          </TouchableOpacity>
        </View>

        {items.map((it) => {
          const uri = curveImageUrl(it.date, it.filename);
          return (
            <View key={`${it.date}-${it.filename}`} style={styles.card}>
              <Text style={styles.cardTitle}>
                {it.home} VS {it.away}
              </Text>
              <Image
                source={{ uri, headers: authHeader }}
                style={styles.img}
                contentFit="contain"
                transition={200}
              />
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UI.bg },
  scroll: { padding: 16, paddingBottom: 32 },
  form: {
    backgroundColor: UI.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UI.border,
    padding: 16,
    marginBottom: 16,
  },
  label: { fontSize: 13, color: UI.muted, marginBottom: 6 },
  input: {
    backgroundColor: UI.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: UI.border,
    padding: 12,
    color: UI.text,
    fontSize: 16,
    marginBottom: 10,
  },
  chips: { marginBottom: 8, maxHeight: 40 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: UI.border,
    borderRadius: 8,
    marginRight: 8,
  },
  chipText: { color: UI.text, fontSize: 13 },
  btn: {
    marginTop: 8,
    backgroundColor: UI.accent,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#022c22', fontWeight: '600', fontSize: 16 },
  card: {
    backgroundColor: UI.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UI.border,
    padding: 12,
    marginBottom: 16,
  },
  cardTitle: { color: UI.text, fontSize: 15, fontWeight: '600', marginBottom: 8 },
  img: { width: '100%', height: 380, backgroundColor: UI.bg },
});
