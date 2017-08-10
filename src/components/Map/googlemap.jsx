import React, {Component} from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import GoogleMap from 'google-map-react';
import LocationMarker from './LocationMarker.jsx';
import {googleClientID} from '../../config/keys';
import {K_SIZE} from './LocationMarker_styles.js';
import * as actions from '../../actions';
import './googlemap.css'

class Map extends Component {
    static propTypes = {
        center: PropTypes.array,
        zoom: PropTypes.number,        
    };

    static defaultProps = {
        center: [-23.54, -46.55], 
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false
    };

    shouldComponentUpdate = shouldPureComponentUpdate;

    // constructor(props) {
    //     super(props);
    // }

    componentWillMount() {
        this.getLocation()
    }

    getLocation() {
        if (navigator.geolocation) {            
            navigator.geolocation.getCurrentPosition(position => {
                this.props.setCenter(position.coords.latitude, position.coords.longitude)                
            })            
        }       
    }

    createMapOptions(maps) {
        // next props are exposed at maps
        // "Animation", "ControlPosition", "MapTypeControlStyle", "MapTypeId",
        // "NavigationControlStyle", "ScaleControlStyle", "StrokePosition", "SymbolPath", "ZoomControlStyle",
        // "DirectionsStatus", "DirectionsTravelMode", "DirectionsUnitSystem", "DistanceMatrixStatus",
        // "DistanceMatrixElementStatus", "ElevationStatus", "GeocoderLocationType", "GeocoderStatus", "KmlLayerStatus",
        // "MaxZoomStatus", "StreetViewStatus", "TransitMode", "TransitRoutePreference", "TravelMode", "UnitSystem"
        return {
        styles: [
          {
            featureType: "transit.station.bus",
            stylers: [
              { visibility: "off" }
            ]
          },
          {
            featureType: 'poi.business',
            stylers: [{visibility: 'off'}]
          }
        ]};
    }

    _onChildClick = (key, childProps) => {
        this.props.history.push(`/location/${key}`)
        // this.props.onCenterChange([childProps.lat, childProps.lng]);
    }

    renderLocationMarkers(place) {
        return (
            <LocationMarker
                key={place.id} 
                lat={place.location.latitude} 
                lng={place.location.longitude}                
                text={place.name} 
            />
        )
    }

    onMapChange(mapState) {
        this.props.getMapState(mapState)
        let timer = 150;
        let counter = 1;
        const that = this;
        (function FBcheckBeforePlaces() {
            const FB = window.FB
            if(FB) {
                that.props.logFBplaces()
            } else {                
                setTimeout(function() {
                    counter++
                    timer = timer + (counter * 100)
                    FBcheckBeforePlaces()                    
                }, timer);                   
            }
            if(counter > 10) return
        })()
    }

    render() {
        return (
            <GoogleMap
                className='map'
                bootstrapURLKeys={{
                    key: googleClientID
                }}
                center={this.props.center}
                options={this.createMapOptions}
                hoverDistance={K_SIZE / 1.2} 
                onChange={mapState => this.onMapChange(mapState)}
                onChildClick={this._onChildClick}
                zoom={this.props.zoom}>           
                {this.props.places.map(this.renderLocationMarkers)}
            </GoogleMap>
        );
    }    
}

function mapStateToProps(state) {
  return { 
    center: state.insta.center,
    pics: state.insta.pics,
    places: state.insta.placesData.data
   };
}

export default withRouter(connect(mapStateToProps, actions)(Map))