import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen pb-24">
      <div className="hero-gradient text-white px-4 pt-8 pb-10 shadow-lg">
        <div className="max-w-lg mx-auto">
          <Link href="/" className="text-white/80 hover:text-white transition-colors text-sm">
            ← ホームに戻る
          </Link>
          <h1 className="text-2xl font-bold mt-3">利用規約</h1>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        <div className="bg-card-bg rounded-2xl shadow-sm border border-border p-5 space-y-6 text-sm leading-relaxed text-foreground">

          <p>
            この利用規約（以下「本規約」）は、「カゴトク」（以下「本アプリ」）の利用条件を定めるものです。ユーザーの皆さまには、本規約に同意いただいた上で本アプリをご利用いただきます。
          </p>

          <section>
            <h2 className="font-bold text-base mb-2">第1条（サービスの概要）</h2>
            <p>本アプリは、以下のサービスを提供します。</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>商品の価格情報を投稿・共有する機能</li>
              <li>店舗間の価格比較機能</li>
              <li>チラシの特売情報を読み取り・共有する機能</li>
              <li>家計簿・買い物リストの管理機能</li>
              <li>ポイントシステムによるインセンティブ提供</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">第2条（アカウント）</h2>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>ユーザーは、Googleアカウントまたはメールアドレスにより本アプリのアカウントを作成できます。</li>
              <li>アカウント情報の管理はユーザー自身の責任において行うものとします。</li>
              <li>アカウントの第三者への譲渡・貸与は禁止します。</li>
            </ol>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">第3条（禁止事項）</h2>
            <p>ユーザーは、以下の行為を行ってはなりません。</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>虚偽の価格情報を意図的に投稿する行為</li>
              <li>スパム行為（大量の無意味な投稿、同一内容の繰り返し投稿など）</li>
              <li>他のユーザーへの嫌がらせ、誹謗中傷</li>
              <li>本アプリの運営を妨害する行為</li>
              <li>不正な手段によるポイントの取得</li>
              <li>本アプリのシステムに対する不正アクセス</li>
              <li>法令または公序良俗に違反する行為</li>
              <li>その他、運営者が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">第4条（投稿データの取り扱い）</h2>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>ユーザーが投稿した価格情報は、他のすべてのユーザーに公開されます。</li>
              <li>投稿データの著作権はユーザーに帰属しますが、運営者はサービス提供のために必要な範囲で利用できるものとします。</li>
              <li>運営者は、禁止事項に該当する投稿を予告なく削除できるものとします。</li>
            </ol>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">第5条（ポイントシステム）</h2>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>ポイントは、本アプリ内での特典交換にのみ使用できます。</li>
              <li>ポイントは取得から1年間有効です。有効期限を過ぎたポイントは自動的に失効します。</li>
              <li>ポイントの換金・現金化はできません。</li>
              <li>不正な手段で取得されたポイントは、運営者の判断により取り消すことがあります。</li>
            </ol>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">第6条（免責事項）</h2>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>本アプリに掲載される価格情報は、ユーザーの投稿に基づくものであり、運営者はその正確性・最新性を保証しません。</li>
              <li>本アプリの利用により生じた損害について、運営者は一切の責任を負いません。</li>
              <li>AIによる画像認識の結果については、誤認識の可能性があります。投稿前に必ず内容をご確認ください。</li>
              <li>通信障害、システム障害等により本アプリが利用できない場合があります。</li>
            </ol>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">第7条（サービスの変更・終了）</h2>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>運営者は、ユーザーに事前通知することなく、本アプリの内容を変更できるものとします。</li>
              <li>運営者は、やむを得ない事由がある場合、本アプリの提供を一時的または永続的に停止・終了できるものとします。</li>
              <li>サービス終了時は、可能な限り事前にアプリ内で告知します。</li>
            </ol>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">第8条（利用規約の変更）</h2>
            <p>
              運営者は、必要に応じて本規約を変更できるものとします。変更後の規約は、アプリ内に掲示した時点から効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">第9条（準拠法・管轄）</h2>
            <p>
              本規約の解釈にあたっては日本法を準拠法とします。本アプリに関する紛争については、日本国の裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <div className="pt-4 border-t border-border text-xs text-muted text-center">
            <p>施行日：2026年3月14日</p>
            <p className="mt-1">運営者：がむくん</p>
            <p className="mt-1">お問い合わせ：gamukunkagotoku@gmail.com</p>
          </div>
        </div>
      </main>
    </div>
  );
}
