import React, { useEffect, useState } from 'react';
import { Map, GeoJSON } from "react-leaflet";
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import RangeSlider from 'react-bootstrap-range-slider';
import countries from './../../Data/countries-50m.json';
import ListCountry from './../../Data/countries.json';

import "./grid-container.css";
import "leaflet/dist/leaflet.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';

const CauseMap = (props) => {
    const years = Object.keys(ListCountry[0].years)
    const [yearId, setYearId] = useState(0)
    const causeName = props.causeName
    const mapBounds = [
        [89, 179],
        [-89, -179]
    ]
    const [play, setPlay] = useState(true)
    
    function getCauseColor(d) {
        return d > 0.1 ? '#800026' :
            d > 0.05 ? '#BD0026' :
                d > 0.03 ? '#E31A1C' :
                    d > 0.02 ? '#FC4E2A' :
                        d > 0.015 ? '#FD8D3C' :
                            d > 0.01 ? '#FEB24C' :
                                d > 0.005 ? '#FED976' :
                                    '#FFEDA0';
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (yearId < years.length && play) {
                if (yearId === years.length - 1) {
                    setPlay(false)
                }
                else {
                    setYearId(parseInt(yearId) + 1)
                }
                countries.features.forEach(element => {
                    countryStyle(element)
                });
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    });

    const getTotalDeaths = (cause, year) => {
        let totalDeaths = 0
        ListCountry.forEach(country => {
            totalDeaths += parseFloat(country.years[year][cause])
        });
        return totalDeaths
    }

    const getPourcentage = (code, cause, year) => {
        const totalDeaths = getTotalDeaths(cause, year)
        let pourc = 0
        let objet = {};
        ListCountry.forEach(country => {
            if (country.code === code) {
                //console.log(country.years[Year]);
                objet = country.years[year];
                if (objet === undefined) {
                    return pourc;
                }
                else {
                    pourc = parseFloat(objet[cause]) / totalDeaths
                    return pourc;

                }
            }
        });
        return pourc;
    }

    let countryStyle = (feature) => {
        return {
            fillColor: getCauseColor(getPourcentage(feature.id, causeName, years[yearId])),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 1
        }
    };

    const onEachCountry = (country, layer) => {
        const countryName = country.properties.name;
        layer.bindPopup(countryName);

        layer.on({
            mouseover: (event) => {
                event.target.setStyle({
                    weight: 2,
                    color: '#000',
                    dashArray: '',
                    fillOpacity: 0.7
                });
            },
            mouseout: (event) => {
                event.target.setStyle({
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 1
                });
            }
        })
    }
    const legend = () => {

        const grades = [0, 0.5, 1, 1.5, 2, 3, 5, 10]
        return grades.map((item, index) => {
            if (index === grades.length - 1) {
                return (
                    <tr style={{ margin: 0 }}>
                        <td style={{ margin: 0 }}> <div style={{ width: 30, height: 30, backgroundColor: getCauseColor(item / 100) }}></div></td>
                        <td style={{ margin: 0 }}> {item}%+</td>
                    </tr>
                );
            }
            else {
                return (
                    <tr style={{ margin: 0 }}>
                        <td style={{ margin: 0 }}> <div style={{ width: 30, height: 30, backgroundColor: getCauseColor(item / 100), margin: 0 }}></div></td>
                        <td style={{ margin: 0 }}> {item}%-{grades[index + 1]}%</td>
                    </tr>
                );
            }

        });
    }

    return (
        <div>

            <div style={{textAlign:"left",fontSize:"20px"}}>
               <h3>{causeName} {years[Math.min(yearId, years.length - 1)]}</h3> 
            </div>

            <div style={{marginTop:"20px",marginLeft:"11cm"}}>

                <Map style={{ height: "60vh", width: "100vh" }} zoom={2} center={[10, 10, 10]} maxZoom={6} minZoom={2} maxBounds={mapBounds} >
                    <GeoJSON style={countryStyle} data={countries.features} onEachFeature={onEachCountry} ></GeoJSON>
                    <div style={{float: "left", borderWidth: 2, borderStyle: "solid", padding: 10, marginTop: 300 }}>
                        <table style={{width:"50px",height:"20px"}}>
                            {legend()}
                        </table>
                    </div>
                </Map>
                

            </div>

            <div  >
                <div style={{marginLeft:"22cm",marginTop:"30px"}}>
                    
                    <Button
                        style={{ width: 60, height: 60, borderRadius: "50%", display: "inline-block" }}
                        togglable={"true"}
                        onClick={() => setPlay(!play)}>
                        {play ? (
                            <FontAwesomeIcon icon={faPause} size="2x" />
                        ) : (
                            <FontAwesomeIcon icon={faPlay} size="2x" />
                        )}
                    </Button>
                </div>

                <div >
                    <RangeSlider
                        style={{ paddingTop: 10 }}
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
                                countries.features.forEach(element => {
                                    countryStyle(element)
                                });
                                setPlay(false)
                            }
                        }
                    />
                </div>
            </div>
        </div>
    )
}

export default CauseMap
