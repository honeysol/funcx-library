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
      objectFillValidation: "Fill all fields",
      uploadingValidation: "Uploading",
      confirmSaveOrDiscard: {
        title: "Save",
        message:
          "Your change has not been saved. " +
          "Please determine to discard or save the change, before you leave this page.",
      },
      confirmSave: {
        title: "Save",
        message: "Are you sure to save this item?",
      },
      confirmDiscard: {
        title: "Discard",
        message: "Are you sure to discard this item?",
      },
      confirmRemove: {
        title: "Remove",
        message: "Are you sure to remove this item?",
      },
      confirmLogout: {
        title: "Log out",
        message: "Are you sure to log out?",
      },
      checkError: {
        title: "Notice",
        message: "Check error message",
      },
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
      objectFillValidation: "すべての項目を入力する必要があります",
      uploadingValidation: "アップロード中です",
      confirmSaveOrDiscard: {
        title: "保存または破棄",
        message:
          "変更が保存されていません。変更を破棄するか、保存するか決めてください",
        saveButton: "保存",
        discardButton: "破棄",
        cancelButton: "キャンセル",
      },
      confirmSave: {
        title: "保存",
        message: "本当に保存しますか？",
        okButton: "保存",
        cancelButton: "キャンセル",
      },
      confirmDiscard: {
        title: "破棄",
        message: "本当に破棄しますか？",
        okButton: "破棄",
        cancelButton: "キャンセル",
      },
      confirmRemove: {
        title: "削除",
        message: "本当に削除しますか？",
        okButton: "削除",
        cancelButton: "キャンセル",
      },
      confirmLogout: {
        title: "ログアウト",
        message: "本当にログアウトしますか？",
        okButton: "ログアウト",
        cancelButton: "キャンセル",
      },
      checkError: {
        title: "確認",
        message:
          "エラーがあるため、保存できません。エラーメッセージを確認してください",
      },
    },
  },
  "en"
);
export default localization;
