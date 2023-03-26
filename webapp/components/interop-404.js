import { PolymerElement, html } from '../node_modules/@polymer/polymer/polymer-element.js';
import '../node_modules/@polymer/iron-icon/iron-icon.js';
import '../node_modules/@polymer/paper-button/paper-button.js';

class Interop404 extends PolymerElement {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
        text-align: center;
        color: var(--app-secondary-color);
      }
      iron-icon {
        display: inline-block;
        width: 60px;
        height: 60px;
      }
      h1 {
        margin: 50px 0 50px 0;
        font-weight: 300;
      }
    </style>
    <div>
      <iron-icon icon="error"></iron-icon>
      <h1>Interop data is not available for this year</h1>
    </div>
    <a href="/">
      <paper-button>Go to the home page</paper-button>
    </a>
`;
  }

  static get is() { return 'interop-404'; }
}

customElements.define(Interop404.is, Interop404);
