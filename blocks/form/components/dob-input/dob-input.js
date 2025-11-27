import { subscribe } from '../../rules/index.js';

export default function decorate(element, fd, container, formId) {
  subscribe(element, formId, (_element, fieldModel) => {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const formatDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    const minAge = Number(fd.properties?.minAge) || 0;
    const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    fieldModel.maximum = formatDate(maxDate);

    if (fd.properties?.maxAge !== undefined) {
      const maxAge = Number(fd.properties.maxAge);
      const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
      fieldModel.minimum = formatDate(minDate);
    }
    _element.classList.remove('field-valid');
  });
}
