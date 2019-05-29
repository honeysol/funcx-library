export default class Localization {
  constructor(localizationData, defaultLang) {
    this.localizationData = localizationData;
    this.defaultLang = defaultLang;
  }
  s(stringId, lang) {
    return (
      this.localizationData[lang || this.defaultLang][stringId] ||
      this.localizationData[this.defaultLang][stringId]
    );
  }
}
