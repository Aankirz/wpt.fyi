import { PathInfo } from '../components/path.js';
import '../components/test-runs-query-builder.js';
import { TestRunsUIBase } from '../components/test-runs.js';
import '../components/test-search.js';
import '../components/wpt-flags.js';
import { WPTFlags } from '../components/wpt-flags.js';
import '../components/wpt-header.js';
import '../components/wpt-permalinks.js';
import '../components/wpt-bsf.js';
import '../node_modules/@polymer/app-route/app-location.js';
import '../node_modules/@polymer/app-route/app-route.js';
import '../node_modules/@polymer/iron-collapse/iron-collapse.js';
import '../node_modules/@polymer/iron-pages/iron-pages.js';
import '../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../node_modules/@polymer/polymer/lib/elements/dom-if.js';
import { html } from '../node_modules/@polymer/polymer/polymer-element.js';
import '../views/wpt-404.js';
import '../views/wpt-interop.js';
import '../views/wpt-results.js';

class WPTApp extends PathInfo(WPTFlags(TestRunsUIBase)) {
  static get is() {
    return 'wpt-app';
  }

  static get template() {
    return html`
      <style>
        section.search {
          position: relative;
        }
        section.search .path {
          margin-top: 1em;
        }
        section.search paper-spinner-lite {
          position: absolute;
          top: 0;
          right: 0;
        }
        .separator {
          border-bottom: solid 1px var(--paper-grey-300);
          padding-bottom: 1em;
          margin-bottom: 1em;
        }
        .path {
          margin-bottom: 16px;
        }
        .path-separator {
          padding: 0 0.1em;
          margin: 0 0.2em;
        }
        .links {
          margin-bottom: 1em;
        }
        test-runs-query-builder {
          display: block;
          margin-bottom: 32px;
        }
        .query-actions paper-button {
          display: inline-block;
        }
        paper-icon-button {
          vertical-align: middle;
          margin-right: 10px;
          padding: 0px;
          height: 28px;
        }
      </style>

      <app-location route="{{route}}" url-space-regex="^/(results|interop)/"></app-location>
      <app-route route="{{route}}" pattern="/:page" data="{{routeData}}" tail="{{subroute}}"></app-route>

      <wpt-header user="[[user]]" is-triage-mode="{{isTriageMode}}"></wpt-header>

      <results-tabs tab="[[page]]" path="[[encodedPath]]" query="[[query]]"></results-tabs>

      <section class="search">
        <div class="path">
          <a href="/[[page]]/?[[ query ]]">wpt</a>
          <!-- The next line is intentionally formatted so to avoid whitespaces between elements. -->
          <template is="dom-repeat" items="[[ splitPathIntoLinkedParts(path) ]]" as="part"
            ><span class="path-separator">/</span><a href="/[[page]][[ part.path ]]?[[ query ]]">[[ part.name ]]</a></template>
        </div>

        <template is="dom-if" if="[[searchPRsForDirectories]]">
          <template is="dom-if" if="[[pathIsASubfolder]]">
            <wpt-prs path="[[path]]"></wpt-prs>
          </template>
        </template>

        <paper-spinner-lite active="[[isLoading]]" class="blue"></paper-spinner-lite>

        <test-search query="[[search]]"
                     structured-query="{{structuredSearch}}"
                     test-runs="[[testRuns]]"
                     test-paths="[[testPaths]]">
        </test-search>

        <template is="dom-if" if="[[ pathIsATestFile ]]">
          <div class="links">
            <ul>
              <li>
                <a href\$="https://github.com/web-platform-tests/wpt/blob/master[[path]]" target="_blank">View source on GitHub</a></li>

                <template is="dom-if" if="[[ !webPlatformTestsLive ]]">
                  <li><a href\$="[[scheme]]://w3c-test.org[[path]]" target="_blank">Run in your
                  browser on w3c-test.org</a></li>
                </template>

                <template is="dom-if" if="[[ webPlatformTestsLive ]]">
                  <li><a href\$="[[scheme]]://wpt.live[[path]]" target="_blank">Run in your
                    browser on wpt.live</a></li>
                </template>
            </ul>
          </div>
        </template>
      </section>

      <div class="separator"></div>

      <template is="dom-if" if="[[showBSFGraph]]">
        <info-banner>
          <paper-icon-button src="[[getCollapseIcon(isBSFCollapsed)]]" onclick="[[handleCollapse]]"></paper-icon-button>
          [[bsfBannerMessage]]
        </info-banner>
        <iron-collapse opened="[[!isBSFCollapsed]]">
          <wpt-bsf></wpt-bsf>
        </iron-collapse>
      </template>

      <template is="dom-if" if="[[resultsTotalsRangeMessage]]">
        <info-banner>
          [[resultsTotalsRangeMessage]]
          <template is="dom-if" if="[[!editable]]">
            <a href="javascript:window.location.search='';"> (switch to the default product set instead)</a>
          </template>
          <wpt-permalinks path="[[path]]"
                          path-prefix="/[[page]]/"
                          query-params="[[queryParams]]"
                          test-runs="[[testRuns]]">
          </wpt-permalinks>
          <paper-button onclick="[[togglePermalinks]]" slot="small">Link</paper-button>
          <paper-button onclick="[[toggleQueryEdit]]" slot="small" hidden="[[!editable]]">Edit</paper-button>
        </info-banner>
      </template>
      <iron-collapse opened="[[editingQuery]]">
        <test-runs-query-builder query-params="[[queryParams]]" on-submit="[[submitQuery]]"></test-runs-query-builder>
      </iron-collapse>

      <iron-pages role="main" selected="[[page]]" attr-for-selected="name" selected-attribute="visible" fallback-selection="404">
        <wpt-results name="results"
                     is-loading="{{resultsLoading}}"
                     structured-search="[[structuredSearch]]"
                     path="{{subroute.path}}"
                     test-runs="{{testRuns}}"
                     test-paths="{{testPaths}}"
                     search-results="{{searchResults}}"
                     is-triage-mode="[[isTriageMode]]"></wpt-results>

        <wpt-interop name="interop"
                     is-loading="{{interopLoading}}"
                     structured-search="[[structuredSearch]]"
                     path="{{subroute.path}}"></wpt-interop>

        <wpt-404 name="404" ></wpt-404>
      </iron-pages>

      <paper-toast id="masterLabelMissing" duration="15000">
        <div style="display: flex;">
          wpt.fyi now includes affected tests results from PRs. <br>
          Did you intend to view results for complete (master) runs only?
          <paper-button onclick="[[addMasterLabel]]">View master runs</paper-button>
          <paper-button onclick="[[dismissToast]]">Dismiss</paper-button>
        </div>
      </paper-toast>
    `;
  }

  static get properties() {
    return {
      page: {
        type: String,
        reflectToAttribute: true,
      },
      user: String,
      path: String,
      testPaths: Set,
      structuredSearch: Object,
      interopLoading: Boolean,
      resultsLoading: Boolean,
      editable: {
        type: Boolean,
        computed: 'computeEditable(queryParams)',
      },
      isLoading: {
        type: Boolean,
        computed: '_computeIsLoading(interopLoading, resultsLoading)',
      },
      searchResults: Array,
      resultsTotalsRangeMessage: {
        type: String,
        computed: 'computeResultsTotalsRangeMessage(page, path, searchResults, shas, productSpecs, to, from, maxCount, labels, master, runIds)',
      },
      bsfBannerMessage: {
        type: String,
        computed: 'computeBSFBannerMessage(isBSFCollapsed)',
      },
      showBSFGraph: {
        type: Boolean,
        computed: 'computeShowBSFGraph(pathIsRootDir, showBSF)',
      },
      isBSFCollapsed: {
        type: Boolean,
        computed: 'computeIsBSFCollapsed()',
      },
      isTriageMode: {
        type: Boolean,
        value: false,
      }
    };
  }

  static get observers() {
    return [
      '_routeChanged(routeData, routeData.*)',
      '_subrouteChanged(subroute, subroute.*)',
    ];
  }

  constructor() {
    super();
    this.togglePermalinks = () => this.shadowRoot.querySelector('wpt-permalinks').open();
    this.toggleQueryEdit = () => {
      this.editingQuery = !this.editingQuery;
    };
    this.handleCollapse = () => {
      this.isBSFCollapsed = !this.isBSFCollapsed;
      this.setLocalStorageFlag(this.isBSFCollapsed, 'isBSFCollapsed');
    };
    this.submitQuery = this.handleSubmitQuery.bind(this);
    this.addMasterLabel = this.handleAddMasterLabel.bind(this);
    this.dismissToast = e => e.target.closest('paper-toast').close();
  }

  connectedCallback() {
    super.connectedCallback();
    const testSearch = this.shadowRoot.querySelector('test-search');
    testSearch.addEventListener('commit', this.handleSearchCommit.bind(this));
    testSearch.addEventListener('autocomplete', this.handleSearchAutocomplete.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  disconnectedCallback() {
    const testSearch = this.shadowRoot.querySelector('test-search');
    testSearch.removeEventListener('commit', this.handleSearchCommit.bind(this));
    testSearch.removeEventListener('autocomplete', this.handleSearchAutocomplete.bind(this));
    super.disconnectedCallback();
  }

  ready() {
    super.ready();
    // Show warning about ?label=experimental missing the master label.
    const labels = this.queryParams && this.queryParams.label;
    if (labels && labels.includes('experimental') && !labels.includes('master')) {
      this.shadowRoot.querySelector('#masterLabelMissing').show();
    }
    this.shadowRoot.querySelector('app-location')
      ._createPropertyObserver('__query', query => this.query = query);
  }

  queryChanged(query) {
    // app-location don't support repeated params.
    this.shadowRoot.querySelector('app-location').__query = query;
    if (this.activeView) {
      this.activeView.query = query;
    }
    super.queryChanged(query);
  }

  _routeChanged(routeData) {
    this.page = routeData.page || 'results';
    if (this.activeView) {
      this.activeView.query = this.query;
    }
  }

  _subrouteChanged(subroute) {
    this.path = subroute.path || '/';
  }

  get activeView() {
    return this.shadowRoot.querySelector(`wpt-${this.page}`);
  }

  _computeIsLoading(interopLoading, resultsLoading) {
    return interopLoading || resultsLoading;
  }

  handleKeyDown(e) {
    // Ignore when something other than body has focus.
    if (e.target !== document.body) {
      return;
    }
    if (e.key === 'n') {
      this.activeView.moveToNext();
    } else if (e.key === 'p') {
      this.activeView.moveToPrev();
    }
  }

  handleSubmitQuery() {
    const builder = this.shadowRoot.querySelector('test-runs-query-builder');
    this.editingQuery = false;
    this.updateQueryParams(builder.queryParams);
  }

  handleSearchCommit(e) {
    const batchUpdate = {
      search: e.detail.query,
      structuredSearch: e.detail.structuredQuery,
    };
    this.setProperties(batchUpdate);
  }

  handleSearchAutocomplete(e) {
    this.shadowRoot.querySelector('test-search').clear();
    this.set('subroute.path', e.detail.path);
  }

  handleAddMasterLabel(e) {
    const builder = this.shadowRoot.querySelector('test-runs-query-builder');
    builder.master = true;
    this.handleSubmitQuery();
    this.dismissToast(e);
  }

  computeEditable(queryParams) {
    if (queryParams.run_id || 'max-count' in queryParams) {
      return false;
    }
    return true;
  }

  computeResultsTotalsRangeMessage(page, path, searchResults, shas, productSpecs, from, to, maxCount, labels, master, runIds) {
    const msg = super.computeResultsRangeMessage(shas, productSpecs, from, to, maxCount, labels, master, runIds);
    if (page === 'results' && searchResults) {
      let subtests = 0, tests = 0;
      for (const r of searchResults) {
        if (r.test.startsWith(this.path)) {
          tests++;
          subtests += Math.max(...r.legacy_status.map(s => s.total));
        }
      }
      if (this.computePathIsATestFile(path)) {
        if (subtests <= 1) {
          return msg;
        }
        return msg.replace('Showing ', `Showing ${subtests} subtests from `);
      }
      let folder = '';
      if (path && path.length > 1) {
        folder = ` in ${path.substring(1)}`;
      }
      let testsAndSubtests = '';
      if (tests > 1) {
        testsAndSubtests += `${tests} tests`;
        if (subtests > 1) {
          testsAndSubtests += ` (${subtests} subtests)`;
        }
        testsAndSubtests += folder;
      }
      return msg.replace(
        'Showing ',
        `Showing ${testsAndSubtests} from `);
    }
    return msg;
  }

  computeBSFBannerMessage(isBSFCollapsed) {
    const actionText = isBSFCollapsed ? 'expand' : 'collapse';
    return `Browser Specific Failures graph (click the arrow to ${actionText})`;
  }

  // Currently we only have BSF data for the entirety of the WPT test suite. To avoid
  // confusing the user, we only display the graph when they are looking at top-level
  // test results and hide it when in a subdirectory.
  computeShowBSFGraph(pathIsRootDir, showBSF) {
    return pathIsRootDir && showBSF;
  }

  computeIsBSFCollapsed() {
    const stored = this.getLocalStorageFlag('isBSFCollapsed');
    if (stored === null) {
      return false;
    }
    return stored;
  }

  getCollapseIcon(isBSFCollapsed) {
    if (isBSFCollapsed) {
      return '/static/expand_more.svg';
    }
    return '/static/expand_less.svg';
  }
}
customElements.define(WPTApp.is, WPTApp);

export { WPTApp };
