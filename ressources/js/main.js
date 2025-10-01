document.addEventListener("DOMContentLoaded", function () {
    const burgerMenu = document.getElementById("burger-menu");
    const navPages = document.getElementById("nav-pages");
    const navLinks = document.querySelectorAll("#nav-pages ul li a");
    const header = document.getElementById("hero");

    // Toggle-Funktion für das Burger-Menü
    burgerMenu.addEventListener("click", function (e) {
        e.stopPropagation();
        this.classList.toggle("active");
        navPages.classList.toggle("show");
    });

    // Schließen des Menüs beim Klick auf einen Link (nur im mobilen Modus)
    navLinks.forEach((link) => {
        link.addEventListener("click", function () {
            if (window.innerWidth <= 700) {
                burgerMenu.classList.remove("active");
                navPages.classList.remove("show");
            }
        });
    });

    // Schließen des Menüs beim Klick außerhalb
    document.addEventListener("click", function (e) {
        if (
            navPages.classList.contains("show") &&
            !navPages.contains(e.target) &&
            !burgerMenu.contains(e.target)
        ) {
            burgerMenu.classList.remove("active");
            navPages.classList.remove("show");
        }
    });

    // Verhindern, dass Klicks innerhalb des Menüs es schließen
    navPages.addEventListener("click", function (e) {
        e.stopPropagation();
    });

    // Tab-Funktionalität mit verbessertem Mischpult-Fade-Effekt
    const tabItems = document.querySelectorAll("#tab-nav-links .nav-item");
    const tabContents = document.querySelectorAll(
        "#tab-container .tab-content"
    );
    const tabContentWrapper = document.querySelector(
        "#tab-container .tab-content-wrapper"
    );

    // Mapping zwischen Tab-Elementen und ihren entsprechenden Inhalten
    const tabMapping = {
        0: "flights",
        1: "flight-hotel",
        2: "car-rent",
        3: "hotel",
    };

    // Funktion zur Messung der Höhe eines versteckten Elements
    function getHiddenElementHeight(element) {
        const originalStyle = {
            display: element.style.display,
            visibility: element.style.visibility,
            position: element.style.position,
            opacity: element.style.opacity,
        };

        element.style.display = "block";
        element.style.visibility = "hidden";
        element.style.position = "absolute";
        element.style.opacity = "0";

        const height = element.offsetHeight;

        element.style.display = originalStyle.display;
        element.style.visibility = originalStyle.visibility;
        element.style.position = originalStyle.position;
        element.style.opacity = originalStyle.opacity;

        return height;
    }

    // Funktion zum Anpassen der Höhe des Containers und Headers
    function updateContainerHeight() {
        // Höhe des höchsten sichtbaren Inhalts verwenden
        let maxHeight = 0;
        const visibleContents = document.querySelectorAll(
            ".tab-content.active, .tab-content.fade-in, .tab-content.fade-out"
        );
        visibleContents.forEach((content) => {
            const height = content.offsetHeight;
            if (height > maxHeight) maxHeight = height;
        });

        if (maxHeight > 0 && tabContentWrapper) {
            tabContentWrapper.style.height = `${maxHeight}px`;

            // Header-Höhe anpassen (mit etwas zusätzlichem Platz)
            const headerPadding = 40; // Anpassen nach Bedarf
            const navLinksHeight =
                document.getElementById("nav-links").offsetHeight;
            const totalHeight = maxHeight + navLinksHeight + headerPadding;

            header.style.height = `${totalHeight}px`;
        }
    }

    // Verbesserte Crossfade-Funktion
    function crossfadeContent(oldContentId, newContentId) {
        const oldContent = document.getElementById(oldContentId);
        const newContent = document.getElementById(newContentId);

        if (!newContent) return;

        // Sicherstellen, dass der neue Inhalt korrekt angezeigt wird
        newContent.style.display = "block";

        // Wenn es bereits einen aktiven Tab gibt
        if (
            oldContent &&
            (oldContent.classList.contains("active") ||
                oldContent.classList.contains("fade-out") ||
                oldContent.classList.contains("fade-in"))
        ) {
            // 1. Alten Inhalt für das Ausblenden vorbereiten
            oldContent.classList.remove("active");
            oldContent.classList.remove("fade-in"); // Falls er gerade eingeblendet wird
            oldContent.classList.add("fade-out");

            // 2. Neuen Inhalt anzeigen und mit voller Sichtbarkeit unter dem alten positionieren
            newContent.classList.remove("fade-out"); // Falls er gerade ausgeblendet wird
            newContent.classList.add("fade-in");

            // 3. Messen der Höhe des neuen Inhalts, auch wenn er noch nicht voll sichtbar ist
            const newContentHeight = getHiddenElementHeight(newContent);
            const oldContentHeight = oldContent.offsetHeight;
            const maxHeight = Math.max(newContentHeight, oldContentHeight);

            // 4. Container-Höhe anpassen, damit beide Inhalte Platz haben
            if (tabContentWrapper) {
                tabContentWrapper.style.height = `${maxHeight}px`;

                // Header-Höhe anpassen
                const headerPadding = 40; // Anpassen nach Bedarf
                const navLinksHeight =
                    document.getElementById("nav-links").offsetHeight;
                const totalHeight = maxHeight + navLinksHeight + headerPadding;

                header.style.height = `${totalHeight}px`;
            }

            // 5. Nach Abschluss der Animation Status aktualisieren
            setTimeout(() => {
                // Alle Übergangsklassen von allen Tabs entfernen
                document.querySelectorAll(".tab-content").forEach((content) => {
                    if (content !== newContent) {
                        content.classList.remove(
                            "active",
                            "fade-in",
                            "fade-out"
                        );
                        content.style.display = "none";
                    }
                });

                // Neuen Inhalt als aktiv markieren
                newContent.classList.remove("fade-in", "fade-out");
                newContent.classList.add("active");

                // Höhe nochmals anpassen
                if (tabContentWrapper) {
                    tabContentWrapper.style.height = `${newContent.offsetHeight}px`;

                    // Header-Höhe anpassen
                    const headerPadding = 40; // Anpassen nach Bedarf
                    const navLinksHeight =
                        document.getElementById("nav-links").offsetHeight;
                    const totalHeight =
                        newContent.offsetHeight +
                        navLinksHeight +
                        headerPadding;

                    header.style.height = `${totalHeight}px`;
                }
            }, 600); // Entspricht der Transition-Zeit
        } else {
            // Falls kein aktiver Inhalt vorhanden ist, direkt neuen Inhalt anzeigen
            document.querySelectorAll(".tab-content").forEach((content) => {
                content.classList.remove("active", "fade-in", "fade-out");
                content.style.display = "none";
            });

            newContent.classList.add("active");

            // Höhe direkt anpassen
            if (tabContentWrapper) {
                tabContentWrapper.style.height = `${newContent.offsetHeight}px`;

                // Header-Höhe anpassen
                const headerPadding = 40; // Anpassen nach Bedarf
                const navLinksHeight =
                    document.getElementById("nav-links").offsetHeight;
                const totalHeight =
                    newContent.offsetHeight + navLinksHeight + headerPadding;

                header.style.height = `${totalHeight}px`;
            }
        }
    }

    // Hilfsvariable, um laufende Übergänge zu verfolgen
    let isTransitioning = false;

    // Event-Listener für jeden Tab hinzufügen
    tabItems.forEach((tab, index) => {
        tab.addEventListener("click", function () {
            // Wenn der Tab bereits aktiv ist, nichts tun
            if (this.classList.contains("active")) return;

            // Wenn bereits ein Übergang läuft, nichts tun
            if (isTransitioning) return;
            isTransitioning = true;

            // Aktiven Status von allen Tabs entfernen und den geklickten Tab aktivieren
            tabItems.forEach((item) => {
                item.classList.remove("active");
            });
            this.classList.add("active");

            // Crossfade-Effekt zwischen Tab-Inhalten
            const currentActiveIndex = Array.from(tabItems).findIndex(
                (item) => item === this
            );

            // Finde den aktuell aktiven Content
            let oldContentId = null;
            document.querySelectorAll(".tab-content").forEach((content) => {
                if (content.classList.contains("active")) {
                    oldContentId = content.id;
                }
            });

            const newContentId = tabMapping[currentActiveIndex];
            crossfadeContent(oldContentId, newContentId);

            // Nach Abschluss des Übergangs den Status zurücksetzen
            setTimeout(() => {
                isTransitioning = false;
            }, 650); // Etwas länger als die Transition-Zeit
        });
    });

    // Initial die Höhe des Containers und Headers anpassen
    setTimeout(() => {
        const activeContent = document.querySelector(".tab-content.active");
        if (activeContent && tabContentWrapper) {
            tabContentWrapper.style.height = `${activeContent.offsetHeight}px`;

            // Header-Höhe anpassen
            const headerPadding = 40; // Anpassen nach Bedarf
            const navLinksHeight =
                document.getElementById("nav-links").offsetHeight;
            const totalHeight =
                activeContent.offsetHeight + navLinksHeight + headerPadding;

            header.style.height = `${totalHeight}px`;
        }
    }, 100); // Kurze Verzögerung, um sicherzustellen, dass die Inhalte gerendert sind

    // Anpassen der Höhe bei Fenstergrößenänderungen
    window.addEventListener("resize", () => {
        setTimeout(updateContainerHeight, 100);
    });
});
