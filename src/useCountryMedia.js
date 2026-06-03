import { useState, useEffect } from 'react'

export function useCountryMedia(countryCode, searchQuery = 'peru-nature', wikiTitle = 'Gastronomía_del_Perú') {
  const [media, setMedia] = useState({
    imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600', // Machu Picchu fallback
    flagUrl: `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`, // Fallback de banderas rápido y estable
    wikiSummary: '',
    capital: 'Desconocida',
    currency: 'Desconocida',
    languages: 'Desconocido',
    population: 'N/A',
    loading: true,
    error: null
  })

  useEffect(() => {
    let active = true

    async function fetchAllMedia() {
      try {
        // 1. Wikipedia API
        let wikiText = ''
        const wikiRes = await fetch(
          `https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${wikiTitle}&format=json&origin=*`
        )
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json()
          const pages = wikiData?.query?.pages
          if (pages) {
            const pageId = Object.keys(pages)[0]
            wikiText = pages[pageId]?.extract || ''
          }
        }

        // 2. REST Countries (para bandera oficial e info geográfica)
        let flag = `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`
        let capital = 'Desconocida'
        let currency = 'Desconocida'
        let languages = 'Desconocido'
        let population = 'N/A'

        try {
          const countryRes = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
          if (countryRes.ok) {
            const countryData = await countryRes.json()
            flag = countryData[0]?.flags?.png || flag
            capital = countryData[0]?.capital?.[0] || 'Desconocida'
            currency = Object.values(countryData[0]?.currencies || {})[0]?.name || 'Desconocida'
            languages = Object.values(countryData[0]?.languages || {}).join(', ') || 'Desconocido'
            population = countryData[0]?.population?.toLocaleString() || 'N/A'
          }
        } catch (e) {
          console.warn("REST Countries falló, usando fallback de FlagCDN");
        }

        // 3. Fallback de imágenes de alta definición según el país para que se vea premium
        let countryImage = 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=600'; // Machu Picchu
        if (countryCode === 'MX') {
          countryImage = 'https://images.unsplash.com/photo-1512813583145-baaa340ef29f?q=80&w=600'; // Teotihuacan/Mexico
        } else if (countryCode === 'TH') {
          countryImage = 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=600'; // Thailand Temple
        }

        if (active) {
          setMedia({
            imageUrl: countryImage,
            flagUrl: flag,
            wikiSummary: wikiText || 'Explorando la enciclopedia ancestral de esta región...',
            capital,
            currency,
            languages,
            population,
            loading: false,
            error: null
          })
        }
      } catch (err) {
        console.error("Error al cargar multimedia de la enciclopedia:", err)
        if (active) {
          setMedia(prev => ({ ...prev, loading: false, error: err.message }))
        }
      }
    }

    fetchAllMedia()
    return () => { active = false }
  }, [countryCode, searchQuery, wikiTitle])

  return media
}

