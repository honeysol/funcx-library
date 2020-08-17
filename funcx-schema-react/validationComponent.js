import { FuncxComponent } from "./core.js";
import { ValidationHelper } from "./validationHelper";

export class ValidationComponent extends FuncxComponent {
  constructor(props) {
    super(props);
    this.validationHelper = new ValidationHelper((validations) => {
      const validationNotPassed = !this.validationHelper.passed();
      this.setState({ validationNotPassed });
    });
  }
  getContext() {
    return Object.assign({}, this.props.context, {
      validationHelper: this.validationHelper,
    });
  }
}
