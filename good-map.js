'use strict';

{
  let initCalled;
  const callbackPromise = new Promise((r) => window.__initGoodMap = r);

  function loadGoogleMaps(apiKey, language, region) {
    if (!initCalled) {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?' +
        (apiKey ? `key=${apiKey}&` : '') +
        (language ? `language=${language}&` : '') +
        (region ? `region=${region}&` : '') +
        'callback=__initGoodMap';
      document.head.appendChild(script);
      initCalled = true;
    }
    return callbackPromise;
  }

  customElements.define('good-map', class extends HTMLElement {
    static get observedAttributes() {
      return ['api-key', 'language', 'region', 'zoom', 'latitude', 'longitude', 'map-options'];
    }

    attributeChangedCallback(name, oldVal, val) {
      switch (name) {
        case 'api-key':
          this.apiKey = val;
          break;
        case 'language':
          this.language = val;
          break;
        case 'region':
          this.region = val;
          break;
        case 'zoom':
        case 'latitude':
        case 'longitude':
          this[name] = parseFloat(val);
          break;
        case 'map-options':
          this.mapOptions = JSON.parse(val);
          break
      }
    }

    constructor() {
      super();

      this.map = null;
      this.apiKey = null;
      this.language = null;
      this.region = null;
      this.zoom = null;
      this.latitude = null;
      this.longitude = null;
      this.mapOptions = {};
    }

    connectedCallback() {
      loadGoogleMaps(this.apiKey, this.language, this.region).then(() => {
        if (!this.mapOptions.zoom) {
          this.mapOptions.zoom = this.zoom || 0;
        }
        if (!this.mapOptions.center) {
          this.mapOptions.center = {
            lat: this.latitude || 0,
            lng: this.longitude || 0
          };
        }
        this.map = new google.maps.Map(this, this.mapOptions);
        this.dispatchEvent(new CustomEvent('google-map-ready', { detail: this.map }));
      });
    }
  });
}
