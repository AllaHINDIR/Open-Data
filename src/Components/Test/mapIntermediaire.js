import React, { useEffect, useState } from 'react';
import { Map, GeoJSON } from "react-leaflet";
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import RangeSlider from 'react-bootstrap-range-slider';
import { withRouter } from "react-router-dom";

import countries from './../../Data/countries-50m.json';
import ListCountry from './../../Data/newResult.json';

import "./MyMapp.css";
import "leaflet/dist/leaflet.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';

const MyMapBackup = (props) => {
    const years = Object.keys(ListCountry[0].years)
    const [yearId, setYearId] = useState(0)

    const [play, setPlay] = useState(true)
    const causeList = [
        "Meningitis",
        "Lower respiratory infections",
        "Intestinal infectious diseases",
        "Protein-energy malnutrition",
        "Terrorism",
        "Cardiovascular diseases",
        "Alzheimer disease and other dementias",
        "Chronic kidney disease",
        "Chronic respiratory diseases",
        "Malaria",
        "Alcohol use disorders"]

    const [causeColor, setCauseColor] = useState(
        Array.from(Array(11))
            .map(x =>
                "#" + (Math.floor(Math.random() * 0xFFFFFF))
                    .toString(16)
            )
    )

    //console.log(causeColor)
    const red = "red"

    const getColor = (cause) => {
        for (let i = 0; i < causeList.length; i++) {
            if (causeList[i] === cause) {
                return causeColor[i];
            }
        }
        return red;
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (yearId < years.length && play) {
                if (yearId === years.length - 1) {
                    setPlay(false)
                    countries.features.forEach(element => {

                        countryStyle(element)
                    });
                }
                else {
                    setYearId(parseInt(yearId) + 1)
                    countries.features.forEach(element => {

                        countryStyle(element)
                    });
                }
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    });

    //cette fct donne tableau des cause pricipales (ou une cause)
    //code: code iso 3 et year est l'annee
    const getPrincipalCause = (code, Year) => {
        let objet = {};
        let ab = ["b"]
        ListCountry.forEach(country => {
            //console.log(country.code);
            //probleme d'incoherence entre les code et ISO_A3
            if (country.code === code) {
                //console.log(country.years[Year]);
                objet = country.years[Year];
                if (objet === undefined) {
                    ab = ["a"]
                    return ab;
                }
                else {

                    ab = Object.keys(objet).filter(x => {
                        return objet[x] == Math.max.apply(null,
                            Object.values(objet));
                    });
                    return ab;

                }
                // console.log(objet);
                // console.log(country.code)
                // return Object.keys(objet).filter(x => {
                //     return objet[x] === Math.max.apply(null, 
                //     Object.values(objet));
                //   });
            }

        });
        //console.log(objet);
        return ab;
    }

    // là il faut passer un parametre à la fct, afin de recuperer la cause 
    let countryStyle = (feature) => {
        //feature est un pays: un element de la liste features dans le fichier countries-50m

        let cause = getPrincipalCause(feature.id, years[yearId])[0];
        return {
            fillColor: getColor(cause),
            //la ou il faut mettre getColor
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.2
        }
    };

    const resetStyle = (code, year) => {
        const cause = getPrincipalCause(code, year)[0];
        return {
            fillColor: getColor(cause), //la ou il faut mettre getColor getColor(getPrincipalCause(feature.properties.ISO_A3,year))
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.2
        }
    }

    const pushToRoute = route => {
        props.history.push(route)

    }

    const onEachCountry = (country, layer) => {
        const countryName = country.properties.name;
        //console.log(countryName);
        layer.bindPopup(countryName);

        //donner automatiquement des couleur en gradient 
        //layer.options.fillOpacity = Math.random(); // valeur [0-1]

        layer.on({
            click: (event) => {
                event.target.setStyle({
                    //on change la couleur du pays 
                    color: "green",
                    fillColor: "yellow",
                });
                const countryCode = event.target.feature.id
                pushToRoute({
                    pathname: '/country/' + countryCode,
                    state: { countryCode: event.target.feature.id }
                })

            },
            mouseover: (event) => {
                event.target.setStyle({
                    weight: 5,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.7
                });

            },
            mouseout: (event) => {
                event.target.setStyle(resetStyle(country.id, years[yearId]));
                //refs.geojson.leafletElement.resetStyle(event.target);
            }
        })

    }

    return (
        <div>
            <h1 style={{ textAlign: "center" }}>
                My Map
            </h1>
            <div>
                <h1 style={{ textAlign: "center" }}>
                    {'Year: ' + years[Math.min(yearId, years.length - 1)]}
                </h1>
            </div>
            <div className="map" style={{ marginRight: "5cm", marginLeft: "25cm" }}>

                <Map style={{ height: "80vh", width: "80vh" }} zoom={2} center={[10, 10, 10]} maxZoom={15} minZoom={2} >
                    <GeoJSON style={countryStyle} data={countries.features} onEachFeature={onEachCountry} ></GeoJSON>
                </Map>
            </div>
            <div style={{ margin: 100 }}>
                <Button togglable={"true"} onClick={() => setPlay(!play)}>
                    {play ? (

                        <FontAwesomeIcon icon={faPause} />
                    ) : (

                        <FontAwesomeIcon icon={faPlay} />
                    )}
                </Button>
                <RangeSlider
                    value={parseInt(years[yearId])}
                    min={parseInt(years[0])}
                    max={parseInt(years[years.length - 1])}
                    onChange={
                        changeEvent => {
                            const getCurrentYearId = () => {
                                for (let i = 0; i < years.length; i++) {
                                    if (years[i] === changeEvent.target.value)
                                        return i
                                }
                                return 0
                            }
                            setYearId(getCurrentYearId())
                            setPlay(false)
                        }
                    }
                />
            </div>
        </div>
    )
}

export default withRouter(MyMapBackup);
