import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { withGoogleMap, GoogleMap } from 'react-google-maps';
import Marker from './Marker';
import Polyline from './Polyline';

const MS_GEOMETRY_DELAY = 50;

const GoogleMapContainer = withGoogleMap(props => (
    <GoogleMap {...props} ref={props.handleMapMounted} />
));

class MapView extends Component {
  state = {
    center: null,
    zoom: 15,
  };

  handleMapMounted = map => {
    this.map = map;
    this.props.onMapReady && this.props.onMapReady();
  };

  animateToRegion(zoom) {
    this.setState({ zoom });
  }

  onGeometryChanged() {
    this.setState({zoom: this.map.getZoom()});
  }

  onCenterChanged() {
    setTimeout(this.onGeometryChanged.bind(this), MS_GEOMETRY_DELAY);
  }

  onDragEnd = () => {
    const { onRegionChangeComplete } = this.props;
    if (this.map && onRegionChangeComplete) {
      const center = this.map.getCenter();
      onRegionChangeComplete({
        latitude: center.lat(),
        longitude: center.lng(),
      });
    }
  };

  render() {
    const { region, initialRegion, onRegionChange, onPress, options } = this.props;
    const { center, zoom } = this.state;
    const style = this.props.style || styles.container;

    const centerProps = region
        ? {
          center: {
            lat: region.latitude,
            lng: region.longitude,
          },
        }
        : center
            ? { center }
            : {
              defaultCenter: {
                lat: initialRegion.latitude,
                lng: initialRegion.longitude,
              },
            };

    return (
        <View style={style}>
          <GoogleMapContainer
              handleMapMounted={this.handleMapMounted}
              containerElement={<div style={{ height: '100%' }} />}
              mapElement={<div style={{ height: '100%' }} />}
              {...centerProps}
              onDragStart={onRegionChange}
              onIdle={this.onDragEnd}
              onClick={onPress}
              options={options}
              onZoomChanged={this.onGeometryChanged.bind(this)}
              onCenterChanged={this.onCenterChanged.bind(this)}
              zoom={zoom}>
            {this.props.children}
          </GoogleMapContainer>
        </View>
    );
  }
}

MapView.Marker = Marker;
MapView.Polyline = Polyline;

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
});

export default MapView;