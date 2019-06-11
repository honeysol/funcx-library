import Localization from "./localization";

const localization = new Localization(
  {
    en: {
      emailValidation: "Invalid Email Address",
      emailDomainValidation: "Mail server not found",
      requiredValidation: "Required",
      rangeValidation: "Out of range",
      patternValidation: "Pattern not match",
      passwordMatchValidation: "Password not match",
      requireValueValidation: "Required",
    },
    ja: {
      emailValidation: "メールアドレスとして正しくない文字列です",
      emailDomainValidation:
        "メールサーバが見つかりません。@より後ろの部分を確認してください",
      requiredValidation: "必須項目です",
      rangeValidation: "数値が範囲外です",
      patternValidation: "文字列のパターンが正しくありません",
      passwordMatchValidation: "パスワードが一致しません",
      requireValueValidation: "必須項目です",
    },
  },
  "en"
);
export default localization;
