# football-betting-mobile

手机端（Expo / React Native），与 **football-betting-platform** 共用同一套 Flask JSON API。

## 功能（与 Web 对齐）

- 登录 / 注册（短信验证码）
- 首页入口：曲线图查询、账户资料、会员状态、充值、充值记录
- 曲线：日期列表、搜索、图片（请求带 `Authorization: Bearer`）
- 账户：资料、改密码 / 邮箱 / 手机

## API 地址

- **模拟器在本机**：可不设，默认 `http://127.0.0.1:5001`。
- **真机 / Expo Go**：`127.0.0.1` 是手机自己，会失败。必须用电脑的局域网 IP，且**只写到端口**，不要加网页路径 `/login`（接口实际是 `/api/auth/login`，由 App 自动拼接）。

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.11.2:5001 npx expo start
```

本地可维护 `football-betting-mobile/.env`（已加入仓库 `.gitignore`，勿提交）；若无该文件，请复制 `.env.example` 为 `.env`。修改 IP 后务必**重新**执行 `npx expo start` 才会生效。

原生 App 直连 HTTP，一般**不**涉及浏览器 CORS；若用 **Expo Web**，需后端允许对应来源。

### 正式包 / 线上 API（与网页 [trybx.cn](https://trybx.cn) 同源服务）

打包时使用 **HTTPS 根地址、不要带端口 5001**（公网手机往往访问不到 `:5001`，应由 Nginx 443 反代到本机 Flask）：

`EXPO_PUBLIC_API_BASE_URL=https://trybx.cn`

**不要**把环境变量写成 `…/login`。App 会自行请求 `https://trybx.cn/api/auth/login` 等接口。

## 打包安装包（Android APK / iOS IPA）

使用 [EAS Build](https://docs.expo.dev/build/introduction/)（Expo 云端编译）。

1. 注册/登录 [expo.dev](https://expo.dev)，安装并登录 CLI：

   ```bash
   npm install
   npx eas-cli login
   ```

2. **首次**在本目录关联项目（会往 `app.json` 写入 `extra.eas.projectId`）：

   ```bash
   cd football-betting-mobile
   npx eas-cli build:configure
   ```

3. 构建：

   ```bash
   npm run build:android
   npm run build:ios
   ```

   或在 `preview` 配置下打内测包：`npm run build:android:preview` / `npm run build:ios:preview`。

4. 完成后在 [expo.dev 控制台](https://expo.dev) 对应项目 **Builds** 里下载 **APK** / **IPA**。

**说明：**

- `eas.json` 的 `production` / `preview` 已设置 `EXPO_PUBLIC_API_BASE_URL=https://trybx.cn`。换域名时改 `eas.json` 的 `env` 后**重新构建**。
- **Android**：当前 `production` 使用 `buildType: "apk"`，便于直接安装。
- **iOS**：需 **Apple 开发者账号**；正式包使用 **HTTPS** 更符合上架要求。
- `app.json` 中 `trybx.cn` 的 HTTP ATS 例外、Android `usesCleartextTraffic` 仍可用于开发机访问 `http://…:5001`；正式 API 以 **HTTPS** 为主。

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

3. 类型检查（可选）

   ```bash
   npx tsc --noEmit
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
