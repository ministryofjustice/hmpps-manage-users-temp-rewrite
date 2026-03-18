import accessibleAutocomplete from 'accessible-autocomplete'

export default () => {
  document.querySelectorAll('.autocomplete-select').forEach(select => {
    accessibleAutocomplete.enhanceSelectElement({
      selectElement: select,
      showAllValues: true,
      preserveNullOptions: true,
    })
  })
}
