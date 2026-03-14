import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pb-24">
      <div className="hero-gradient text-white px-4 pt-8 pb-10 shadow-lg">
        <div className="max-w-lg mx-auto">
          <Link href="/" className="text-white/80 hover:text-white transition-colors text-sm">
            ← ホームに戻る
          </Link>
          <h1 className="text-2xl font-bold mt-3">プライバシーポリシー</h1>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        <div className="bg-card-bg rounded-2xl shadow-sm border border-border p-5 space-y-6 text-sm leading-relaxed text-foreground">

          <p>
            「カゴトク」（以下「本アプリ」）は、ユーザーの皆さまのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーは、本アプリにおける個人情報の取り扱いについて定めるものです。
          </p>

          <section>
            <h2 className="font-bold text-base mb-2">1. 収集する情報</h2>
            <p>本アプリでは、以下の情報を収集することがあります。</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><span className="font-medium">アカウント情報：</span>メールアドレス、ニックネーム、パスワード（ハッシュ化して保存）</li>
              <li><span className="font-medium">投稿データ：</span>商品名、店舗名、価格、位置情報（任意）</li>
              <li><span className="font-medium">利用データ：</span>ポイント履歴、お気に入り、買い物リスト</li>
              <li><span className="font-medium">端末情報：</span>ブラウザの種類、OS、画面サイズ</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">2. 利用目的</h2>
            <p>収集した情報は、以下の目的で利用します。</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>本アプリの機能提供・改善</li>
              <li>ユーザー認証およびアカウント管理</li>
              <li>価格情報の共有・比較サービスの提供</li>
              <li>ポイントシステムの運営</li>
              <li>お問い合わせへの対応</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">3. Cookie・ローカルストレージの使用</h2>
            <p>
              本アプリでは、ユーザー体験の向上およびオフライン機能の提供のため、Cookie およびブラウザのローカルストレージを使用しています。
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><span className="font-medium">ローカルストレージ：</span>プロフィール情報、投稿データ、ポイント履歴、お気に入り、買い物リストなどをオフラインでも利用できるよう端末に保存します</li>
              <li><span className="font-medium">Cookie：</span>ログインセッションの維持に使用します</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">4. 第三者サービスの利用</h2>
            <p>本アプリでは、以下の第三者サービスを利用しています。各サービスのプライバシーポリシーもあわせてご確認ください。</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <span className="font-medium">Supabase：</span>ユーザー認証およびデータベースサービスとして使用しています。データはSupabaseのサーバーに保存されます。
              </li>
              <li>
                <span className="font-medium">Google（OAuth認証）：</span>Googleアカウントによるログイン機能を提供しています。Googleから取得する情報はメールアドレスおよび表示名のみです。
              </li>
              <li>
                <span className="font-medium">Anthropic API（Claude）：</span>商品写真・レシート・チラシの画像認識に使用しています。送信された画像データはAIによる解析にのみ使用され、Anthropic社のプライバシーポリシーに従い処理されます。
              </li>
              <li>
                <span className="font-medium">OpenStreetMap：</span>地図表示および店舗位置情報の表示に使用しています。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">5. 広告配信について</h2>
            <p>
              本アプリでは、将来的にGoogle AdSense等の広告配信サービスを導入する予定です。導入時には、広告配信のためにCookieを使用し、ユーザーの興味に基づいた広告が表示される場合があります。詳細は導入時に本ポリシーを更新してお知らせします。
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">6. 情報の管理・保護</h2>
            <p>
              収集した個人情報は、不正アクセス・紛失・改ざん・漏洩等の防止のため、適切なセキュリティ対策を講じて管理します。
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">7. 個人情報の開示・削除</h2>
            <p>
              ユーザーは、マイページからアカウント情報の変更・削除を行うことができます。アカウントを削除した場合、関連するデータはすべて削除されます。
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">8. プライバシーポリシーの変更</h2>
            <p>
              本ポリシーの内容は、必要に応じて変更することがあります。重要な変更がある場合は、アプリ内でお知らせします。
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">9. お問い合わせ</h2>
            <p>本ポリシーに関するお問い合わせは、以下までご連絡ください。</p>
            <div className="bg-background rounded-xl p-3 mt-2">
              <p>アプリ名：カゴトク</p>
              <p>運営者：がむくん</p>
              <p>メール：gamukunkagotoku@gmail.com</p>
            </div>
          </section>

          <div className="pt-4 border-t border-border text-xs text-muted text-center">
            <p>施行日：2026年3月14日</p>
          </div>
        </div>
      </main>
    </div>
  );
}
