import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Mode = 'login' | 'register';
type ViewName = 'auth' | 'home' | 'curves';

interface User {
  username?: string;
  phone?: string;
  token?: string;
}

// 已根据你的机器 IP 设置好端口
const API_BASE_URL = 'http://192.168.11.2:5001';

export default function AppScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [view, setView] = useState<ViewName>('auth');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 曲线查询相关状态
  const [date, setDate] = useState('');
  const [team, setTeam] = useState('');
  const [searching, setSearching] = useState(false);
  const [curves, setCurves] = useState<
    { date: string; home: string; away: string; filename: string }[]
  >([]);

  const resetAuthForm = () => {
    setPhone('');
    setPassword('');
    setConfirmPassword('');
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    resetAuthForm();
  };

  const validatePhone = (value: string) => /^\d{11}$/.test(value);

  const handleLoginOrRegister = async () => {
    if (!phone || !password || (mode === 'register' && !confirmPassword)) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }
    if (!validatePhone(phone)) {
      Alert.alert('提示', '请输入 11 位有效手机号');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    setLoading(true);

    if (mode === 'login') {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phone.trim(),
            password,
          }),
        });
        const data = await resp.json();
        if (!resp.ok || !data.ok) {
          Alert.alert('登录失败', data.message || '请检查手机号或密码');
        } else {
          const user: User = {
            username: data.user?.username,
            phone: data.user?.phone,
            token: data.token,
          };
          setCurrentUser(user);
          setView('home');
        }
      } catch (e) {
        Alert.alert('网络错误', '无法连接到服务器，请稍后重试');
      } finally {
        setLoading(false);
      }
    } else {
      // 注册暂时简单模拟，后续如需可接 /api/auth/send-code 与 /api/auth/register
      setTimeout(() => {
        setLoading(false);
        Alert.alert('注册成功', `账号已创建：${phone}（当前先不真正写入服务器）`);
        switchMode('login');
      }, 800);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('auth');
    resetAuthForm();
  };

  const handleSearchCurves = async () => {
    const d = date.trim();
    const t = team.trim();
    if (!/^\d{8}$/.test(d)) {
      Alert.alert('提示', '请输入有效日期（YYYYMMDD）');
      return;
    }
    if (!t) {
      Alert.alert('提示', '请填写球队名（主队或客队名称）');
      return;
    }

    setSearching(true);
    setCurves([]);

    try {
      const url =
        `${API_BASE_URL}/api/curves/search?date=` +
        encodeURIComponent(d) +
        `&team=` +
        encodeURIComponent(t);
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.error) {
        Alert.alert('查询失败', data.error);
        return;
      }
      const items: any[] = data.items || [];
      if (items.length === 0) {
        Alert.alert('提示', '该条件下没有找到曲线图。');
        return;
      }
      setCurves(
        items.map((it) => ({
          date: it.date,
          home: it.home,
          away: it.away,
          filename: it.filename,
        })),
      );
    } catch (e: any) {
      Alert.alert('请求失败', e?.message || '网络错误');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (view === 'curves' && !date) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      setDate(`${y}${m}${d}`);
    }
  }, [view, date]);

  const renderAuthView = () => (
    <View style={styles.container}>
      <Text style={styles.logoText}>Football Betting</Text>
      <Text style={styles.subtitle}>
        {mode === 'login' ? '登录查看综合评估曲线' : '创建新账号开始使用'}
      </Text>

      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switchButton, mode === 'login' && styles.switchButtonActive]}
          onPress={() => switchMode('login')}
        >
          <Text
            style={[
              styles.switchText,
              mode === 'login' && styles.switchTextActive,
            ]}
          >
            登录
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchButton, mode === 'register' && styles.switchButtonActive]}
          onPress={() => switchMode('register')}
        >
          <Text
            style={[
              styles.switchText,
              mode === 'register' && styles.switchTextActive,
            ]}
          >
            注册
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>手机号</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="请输入 11 位手机号"
          keyboardType="phone-pad"
          autoCapitalize="none"
          placeholderTextColor="#6b7280"
        />

        <Text style={styles.label}>密码</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="请输入密码"
          secureTextEntry
          placeholderTextColor="#6b7280"
        />

        {mode === 'register' && (
          <>
            <Text style={styles.label}>确认密码</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="请再次输入密码"
              secureTextEntry
              placeholderTextColor="#6b7280"
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleLoginOrRegister}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHomeView = () => (
    <View style={styles.container}>
      <Text style={styles.logoText}>
        欢迎，{currentUser?.username || currentUser?.phone || '用户'}
      </Text>
      <Text style={styles.homeText}>您已登录。</Text>

      <TouchableOpacity
        style={[styles.submitButton, { marginTop: 24 }]}
        onPress={() => setView('curves')}
      >
        <Text style={styles.submitText}>曲线图查询</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={handleLogout}>
        <Text style={styles.linkText}>退出登录</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurvesView = () => (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setView('home')}>
        <Text style={styles.backText}>← 返回首页</Text>
      </TouchableOpacity>

      <Text style={[styles.logoText, { fontSize: 22, marginTop: 8 }]}>
        曲线图查询
      </Text>

      <View style={styles.searchCard}>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>日期</Text>
          <TextInput
            style={styles.fieldInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYYMMDD"
            keyboardType="number-pad"
            maxLength={8}
            placeholderTextColor="#6b7280"
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>球队名</Text>
          <TextInput
            style={styles.fieldInput}
            value={team}
            onChangeText={setTeam}
            placeholder="主队或客队名称"
            placeholderTextColor="#6b7280"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, searching && styles.submitButtonDisabled]}
          onPress={handleSearchCurves}
          disabled={searching}
        >
          <Text style={styles.submitText}>{searching ? '搜索中...' : '搜索'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ marginTop: 16 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {curves.map((item) => {
          const imgUrl =
            `${API_BASE_URL}/api/curves/img/` +
            item.date +
            '/' +
            encodeURIComponent(item.filename);
          return (
            <View key={item.date + item.filename} style={styles.card}>
              <Text style={styles.cardTitle}>
                {item.home} VS {item.away}
              </Text>
              <Image
                source={{ uri: imgUrl }}
                style={styles.cardImage}
                resizeMode="contain"
              />
            </View>
          );
        })}
        {curves.length === 0 && (
          <Text style={styles.emptyText}>请输入条件并点击搜索查看曲线图。</Text>
        )}
      </ScrollView>
    </View>
  );

  const renderContent = () => {
    if (!currentUser || view === 'auth') {
      return renderAuthView();
    }
    if (view === 'home') {
      return renderHomeView();
    }
    return renderCurvesView();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderContent()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050816',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 24,
  },
  homeText: {
    fontSize: 15,
    color: '#e5e7eb',
    marginTop: 8,
  },
  backText: {
    fontSize: 14,
    color: '#60a5fa',
  },
  switchRow: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 999,
    padding: 4,
    marginBottom: 16,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  switchButtonActive: {
    backgroundColor: '#22c55e',
  },
  switchText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  switchTextActive: {
    color: '#0f172a',
  },
  form: {
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    color: '#e5e7eb',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#020617',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f9fafb',
    fontSize: 14,
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#22c55e',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#022c22',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'flex-start',
  },
  linkText: {
    color: '#60a5fa',
    fontSize: 13,
  },
  searchCard: {
    marginTop: 20,
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 16,
    borderColor: '#1f2937',
    borderWidth: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  fieldLabel: {
    width: 70,
    fontSize: 13,
    color: '#e5e7eb',
  },
  fieldInput: {
    flex: 1,
    backgroundColor: '#020617',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#f9fafb',
    fontSize: 14,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 12,
    borderColor: '#1f2937',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 15,
    color: '#e5e7eb',
    marginBottom: 8,
    fontWeight: '500',
  },
  cardImage: {
    width: '100%',
    height: 420,
    backgroundColor: '#020617',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#9ca3af',
  },
});
