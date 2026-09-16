const RoomManager = (() => {
  const dialog = document.querySelector('#room-dialog');
  const form = document.querySelector('#room-form');
  const input = document.querySelector('#room-name');
  const error = document.querySelector('#room-error');
  let itemSelect = null;

  function open() {
    itemSelect = document.querySelector('#modal').open ? document.querySelector('#fields select[name="room"]') : null;
    input.value = ''; error.textContent = '';
    dialog.showModal(); input.focus();
  }
  function add(value) {
    const name = normalizeRoomName(value);
    if (!name || name.length > 60) throw new Error('Enter a room name between 1 and 60 characters.');
    if (personalRooms().some(room => roomKey(room[0]) === roomKey(name))) throw new Error('A room with this name already exists. Choose a different name.');
    if ((data.rooms || []).length >= 100) throw new Error('You can create up to 100 custom rooms.');
    if (!persist({...data, rooms:[...(data.rooms || []), name]})) throw new Error('The room could not be saved. Device storage is full or unavailable.');
    return name;
  }
  form.addEventListener('submit', event => {
    event.preventDefault(); error.textContent = '';
    try {
      const name = add(input.value);
      if (itemSelect) {
        itemSelect.innerHTML = roomOptions(name);
        itemSelect.value = name;
      } else {
        inventoryMode = 'personal'; navigate('rooms');
      }
      dialog.close(); notify('Room added. You can now assign belongings to it.');
    } catch (failure) { error.textContent = failure.message; }
  });
  document.querySelectorAll('[data-close-room]').forEach(button => button.addEventListener('click', () => dialog.close()));
  document.addEventListener('click', event => { if(event.target.closest('[data-add-room]')) open(); });
  return {open, add};
})();
