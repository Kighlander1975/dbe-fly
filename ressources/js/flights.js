document.addEventListener("DOMContentLoaded", function() {
    // Globale Variable für alle Flüge, damit wir später filtern können
    let allFlights = [];
    
    // Suchparameter (später für Filterung verwendbar)
    let searchParams = {
        // Standardmäßig werden alle Flüge angezeigt
        startAirport: null,
        destAirport: null,
        date: null,
        maxPrice: null,
        maxStops: null
    };

    // Funktion zum Laden der Flugdaten aus der JSON-Datei
    async function loadFlights() {
        try {
            const response = await fetch('ressources/data/flights.json');
            if (!response.ok) {
                throw new Error('Fehler beim Laden der Flugdaten');
            }
            allFlights = await response.json();
            
            // Flüge mit zufälligen Zeiten anreichern
            allFlights = allFlights.map((flight, index) => {
                const departureTime = generateRandomTime(index, allFlights.length);
                const arrivalTime = calculateArrivalTime(departureTime, flight.flugdauer);
                
                return {
                    ...flight,
                    departureTime,
                    arrivalTime
                };
            });
            
            // Alle Flüge anzeigen (später kann hier gefiltert werden)
            displayFlights(allFlights);
            
            // News-Content nach unten verschieben
            adjustNewsContentPosition();
        } catch (error) {
            console.error('Fehler:', error);
            const searchResultsSection = document.querySelector('.search-results.active');
            searchResultsSection.innerHTML = '<p>Flugdaten konnten nicht geladen werden.</p>';
        }
    }

    // Funktion zum Anpassen der Position des News-Contents
    function adjustNewsContentPosition() {
        const searchResults = document.querySelector('.search-results.active');
        const newsSection = document.querySelector('.news-section');
        
        if (searchResults && newsSection) {
            // Berechne die Höhe des Suchergebnisbereichs
            const searchResultsHeight = searchResults.offsetHeight;
            
            // Setze einen Mindestabstand zwischen den Suchergebnissen und dem News-Bereich
            const minMargin = 20; // 20px Mindestabstand
            
            // Setze den oberen Rand des News-Bereichs
            newsSection.style.marginTop = minMargin + 'px';
        }
    }

    // Funktion zum Extrahieren des Flughafencodes aus dem String "Stadt (CODE)"
    function extractAirportCode(airportString) {
        const codeMatch = airportString.match(/\(([A-Z]{3})\)/);
        return codeMatch ? codeMatch[1] : airportString;
    }

    // Funktion zum Generieren einer zufälligen Startzeit zwischen 6:00 und 22:00
    function generateRandomTime(index, totalFlights) {
        // Verteilung der Flüge über den Tag (6:00 - 22:00)
        const totalMinutesInDay = (22 - 6) * 60; // 16 Stunden in Minuten
        const minutesPerFlight = Math.floor(totalMinutesInDay / totalFlights);
        
        // Basisminuten für diesen Flug (sorgt für aufsteigende Reihenfolge)
        let baseMinutes = 6 * 60 + (index * minutesPerFlight);
        
        // Kleine zufällige Abweichung, aber auf 5er oder 10er gerundet
        const randomOffset = Math.floor(Math.random() * 20) * 5; // 0, 5, 10, 15, ... bis 95 Minuten
        baseMinutes = Math.min(baseMinutes + randomOffset, 22 * 60); // Nicht später als 22:00
        
        const hours = Math.floor(baseMinutes / 60);
        const minutes = baseMinutes % 60;
        // Auf 5er oder 10er Minuten runden
        const roundedMinutes = Math.floor(minutes / 5) * 5;
        
        return {
            hours: hours,
            minutes: roundedMinutes,
            formatted: `${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`
        };
    }

    // Funktion zum Berechnen der Ankunftszeit basierend auf Startzeit und Flugdauer
    function calculateArrivalTime(departureTime, duration) {
        // Flugdauer im Format "Xh Ym" parsen
        const durationMatch = duration.match(/(\d+)h\s*(\d+)m/);
        if (!durationMatch) return "00:00";
        
        const durationHours = parseInt(durationMatch[1]);
        const durationMinutes = parseInt(durationMatch[2]);
        
        // Startzeit in Minuten umrechnen
        const startMinutes = departureTime.hours * 60 + departureTime.minutes;
        
        // Ankunftszeit in Minuten berechnen
        let arrivalMinutes = startMinutes + (durationHours * 60) + durationMinutes;
        
        // Stunden und Minuten extrahieren
        const hours = Math.floor(arrivalMinutes / 60) % 24; // Modulo 24 für Überläufe in den nächsten Tag
        const minutes = arrivalMinutes % 60;
        
        return {
            hours: hours,
            minutes: minutes,
            formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        };
    }

    // Funktion zum Formatieren des Preises
    function formatPrice(priceString) {
        // Extrahiere nur die Zahl aus dem String und formatiere sie mit 2 Nachkommastellen
        const priceMatch = priceString.match(/(\d+)/);
        if (!priceMatch) return "0.00";
        
        const price = parseInt(priceMatch[1]);
        return price.toFixed(2).replace('.', ',');
    }

    // Funktion zum Erstellen des DOM-Elements für einen einzelnen Flug
    function createFlightElement(flight) {
        const startAirport = extractAirportCode(flight.start);
        const destAirport = extractAirportCode(flight.ziel);
        const economyPrice = formatPrice(flight.preis.economy);
        const businessPrice = formatPrice(flight.preis.business);
        
        // Extrahiere Stunden und Minuten aus der Flugdauer
        const durationMatch = flight.flugdauer.match(/(\d+)h\s*(\d+)m/);
        const durationHours = durationMatch ? durationMatch[1] : "0";
        const durationMinutes = durationMatch ? durationMatch[2] : "0";
        
        // Erstelle einen kompletten Flug-Container mit der benötigten Struktur
        const flightsContainer = document.createElement('div');
        flightsContainer.className = 'flights';
        
        const flightDiv = document.createElement('div');
        flightDiv.className = 'flight';
        
        // Flight details container
        const flightDetails = document.createElement('div');
        flightDetails.className = 'flight-details';
        
        // From-To Container
        const fromTo = document.createElement('div');
        fromTo.className = 'from-to';
        
        // From (Start) section
        const fromDiv = document.createElement('div');
        fromDiv.className = 'from';
        
        const startzeitStart = document.createElement('div');
        startzeitStart.className = 'startzeit-start';
        startzeitStart.textContent = flight.departureTime.formatted;
        
        const portStart = document.createElement('div');
        portStart.className = 'port-start';
        portStart.textContent = startAirport;
        
        const terminalStart = document.createElement('div');
        terminalStart.className = 'terminal-start';
        terminalStart.innerHTML = '&nbsp;';
        
        fromDiv.appendChild(startzeitStart);
        fromDiv.appendChild(portStart);
        fromDiv.appendChild(terminalStart);
        
        // Stops section
        const stopsDiv = document.createElement('div');
        stopsDiv.className = 'stops';
        
        const stopsLineLeft = document.createElement('div');
        stopsLineLeft.className = 'stops-line-left';
        
        const stopMarker = document.createElement('div');
        stopMarker.className = 'stop-marker';
        
        const stopNumber = document.createElement('div');
        stopNumber.className = 'stop-number';
        stopNumber.textContent = flight.stops;
        
        const stopText = document.createElement('div');
        stopText.className = 'stop-text';
        stopText.textContent = flight.stops === 1 ? 'Stopp' : 'Stopps';
        
        stopMarker.appendChild(stopNumber);
        stopMarker.appendChild(stopText);
        
        const stopsLineRight = document.createElement('div');
        stopsLineRight.className = 'stops-line-right';
        
        stopsDiv.appendChild(stopsLineLeft);
        stopsDiv.appendChild(stopMarker);
        stopsDiv.appendChild(stopsLineRight);
        
        // To (Destination) section
        const toDiv = document.createElement('div');
        toDiv.className = 'to';
        
        const startzeitDest = document.createElement('div');
        startzeitDest.className = 'startzeit-dest';
        startzeitDest.textContent = flight.arrivalTime.formatted;
        
        const portDest = document.createElement('div');
        portDest.className = 'port-dest';
        portDest.textContent = destAirport;
        
        const terminalDest = document.createElement('div');
        terminalDest.className = 'terminal-dest';
        terminalDest.textContent = `Terminal ${flight.terminal}`;
        
        toDiv.appendChild(startzeitDest);
        toDiv.appendChild(portDest);
        toDiv.appendChild(terminalDest);
        
        // Flight duration section
        const flightDuration = document.createElement('div');
        flightDuration.className = 'flight-duration';
        
        const durationInfo = document.createElement('div');
        durationInfo.className = 'duration-info';
        
        const durationImg = document.createElement('img');
        durationImg.src = 'ressources/images/time-svgrepo-com.svg';
        durationImg.alt = 'Uhr-Symbol als Platzhalter für Dauer';
        
        const durationText = document.createElement('div');
        durationText.className = 'duration-text';
        
        const hoursSpan = document.createElement('span');
        hoursSpan.className = 'hours';
        hoursSpan.textContent = durationHours;
        
        const minutesSpan = document.createElement('span');
        minutesSpan.className = 'minutes';
        minutesSpan.textContent = durationMinutes;
        
        durationText.appendChild(document.createTextNode('Dauer: '));
        durationText.appendChild(hoursSpan);
        durationText.appendChild(document.createTextNode('h '));
        durationText.appendChild(minutesSpan);
        durationText.appendChild(document.createTextNode('min'));
        
        durationInfo.appendChild(durationImg);
        durationInfo.appendChild(durationText);
        flightDuration.appendChild(durationInfo);
        
        // Economy price section
        const priceEco = document.createElement('div');
        priceEco.className = 'price-eco';
        
        const ecoH6 = document.createElement('h6');
        ecoH6.textContent = 'Economy';
        
        const ecoP1 = document.createElement('p');
        ecoP1.textContent = 'ab';
        
        const ecoH5 = document.createElement('h5');
        ecoH5.className = 'eco-price';
        ecoH5.textContent = economyPrice;
        
        const ecoP2 = document.createElement('p');
        ecoP2.textContent = 'EUR';
        
        const ecoChevron = document.createElement('div');
        ecoChevron.className = 'chevron eco';
        ecoChevron.innerHTML = `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>`;
        
        priceEco.appendChild(ecoH6);
        priceEco.appendChild(ecoP1);
        priceEco.appendChild(ecoH5);
        priceEco.appendChild(ecoP2);
        priceEco.appendChild(ecoChevron);
        
        // Business price section
        const priceBusiness = document.createElement('div');
        priceBusiness.className = 'price-business';
        
        const busiH6 = document.createElement('h6');
        busiH6.textContent = 'Business';
        
        const busiP1 = document.createElement('p');
        busiP1.textContent = 'ab';
        
        const busiH5 = document.createElement('h5');
        busiH5.className = 'busi-price';
        busiH5.textContent = businessPrice;
        
        const busiP2 = document.createElement('p');
        busiP2.textContent = 'EUR';
        
        const busiChevron = document.createElement('div');
        busiChevron.className = 'chevron busi';
        busiChevron.innerHTML = `<svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>`;
        
        priceBusiness.appendChild(busiH6);
        priceBusiness.appendChild(busiP1);
        priceBusiness.appendChild(busiH5);
        priceBusiness.appendChild(busiP2);
        priceBusiness.appendChild(busiChevron);
        
        // Zusammenfügen aller Elemente
        fromTo.appendChild(fromDiv);
        fromTo.appendChild(stopsDiv);
        fromTo.appendChild(toDiv);
        fromTo.appendChild(flightDuration);
        
        flightDetails.appendChild(fromTo);
        flightDetails.appendChild(priceEco);
        flightDetails.appendChild(priceBusiness);
        
        flightDiv.appendChild(flightDetails);
        flightsContainer.appendChild(flightDiv);
        
        return flightsContainer;
    }

    // Funktion zum Filtern der Flüge basierend auf den Suchparametern
    function filterFlights() {
        // Wenn keine Suchparameter gesetzt sind, alle Flüge zurückgeben
        if (!searchParams.startAirport && 
            !searchParams.destAirport && 
            !searchParams.date && 
            !searchParams.maxPrice && 
            !searchParams.maxStops) {
            return allFlights;
        }
        
        // Filtern der Flüge basierend auf den gesetzten Suchparametern
        return allFlights.filter(flight => {
            // Prüfen, ob der Startflughafen übereinstimmt (falls gesetzt)
            if (searchParams.startAirport && 
                extractAirportCode(flight.start) !== searchParams.startAirport) {
                return false;
            }
            
            // Prüfen, ob der Zielflughafen übereinstimmt (falls gesetzt)
            if (searchParams.destAirport && 
                extractAirportCode(flight.ziel) !== searchParams.destAirport) {
                return false;
            }
            
            // Prüfen, ob die maximale Anzahl an Stopps nicht überschritten wird (falls gesetzt)
            if (searchParams.maxStops !== null && 
                flight.stops > searchParams.maxStops) {
                return false;
            }
            
            // Prüfen, ob der Economy-Preis unter dem maximalen Preis liegt (falls gesetzt)
            if (searchParams.maxPrice !== null) {
                const priceMatch = flight.preis.economy.match(/(\d+)/);
                if (priceMatch) {
                    const price = parseInt(priceMatch[1]);
                    if (price > searchParams.maxPrice) {
                        return false;
                    }
                }
            }
            
            // Wenn alle Bedingungen erfüllt sind, Flug in die Ergebnisse aufnehmen
            return true;
        });
    }

    // Funktion zum Anzeigen der gefilterten Flüge
    function displayFlights(flights) {
        // Referenz auf die search-results section
        const searchResultsSection = document.querySelector('.search-results.active');
        
        // Entferne alle vorhandenen Inhalte
        searchResultsSection.innerHTML = '';
        
        // Wenn keine Flüge gefunden wurden, entsprechende Nachricht anzeigen
        if (flights.length === 0) {
            const noFlightsMessage = document.createElement('div');
            noFlightsMessage.className = 'no-flights-message';
            noFlightsMessage.textContent = 'Keine Flüge gefunden, die Ihren Suchkriterien entsprechen.';
            searchResultsSection.appendChild(noFlightsMessage);
        } else {
            // Füge jeden Flug direkt zur search-results section hinzu
            flights.forEach(flight => {
                const flightElement = createFlightElement(flight);
                searchResultsSection.appendChild(flightElement);
            });
        }
        
        // Aktualisiere die Position des News-Bereichs
        setTimeout(adjustNewsContentPosition, 100);
    }

    // Funktion zum Aktualisieren der Suchparameter und Neuanzeigen der gefilterten Flüge
    function updateSearch(params) {
        // Suchparameter aktualisieren
        searchParams = {
            ...searchParams,
            ...params
        };
        
        // Flüge filtern und anzeigen
        const filteredFlights = filterFlights();
        displayFlights(filteredFlights);
    }

    // Beispiel für eine Suchfunktion, die später implementiert werden kann
    function setupSearchForm() {
        // Event-Listener für das "Nur Nonstop Flüge" Checkbox
        const nonstopCheckbox = document.getElementById('nonstop');
        if (nonstopCheckbox) {
            nonstopCheckbox.addEventListener('change', function() {
                updateSearch({ maxStops: this.checked ? 0 : null });
            });
        }
        
        // Event-Listener für das Suchformular
        const searchForm = document.querySelector('#flights form');
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Startflughafen und Zielflughafen aus den Eingabefeldern holen
                const fromInput = document.getElementById('fromAP');
                const toInput = document.getElementById('toAP');
                
                // Suchparameter aktualisieren
                const params = {};
                if (fromInput && fromInput.value) {
                    params.startAirport = fromInput.value;
                }
                if (toInput && toInput.value) {
                    params.destAirport = toInput.value;
                }
                
                // Suche aktualisieren
                updateSearch(params);
            });
        }
    }

    // Funktion zum Hinzufügen von Event-Listenern für Fenstergrößenänderungen
    function setupResizeListener() {
        window.addEventListener('resize', adjustNewsContentPosition);
    }

    // Öffentliche Funktionen, die von außen aufgerufen werden können
    window.flightApp = {
        updateSearch: updateSearch,
        getAllFlights: function() { return allFlights; },
        getCurrentFilteredFlights: filterFlights
    };

    // Initialisierung
    loadFlights();
    setupSearchForm();
    setupResizeListener();
});
