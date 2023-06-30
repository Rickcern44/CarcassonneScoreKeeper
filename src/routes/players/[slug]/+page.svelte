<script>
  import { ArrowLeftIcon, EditIcon} from 'svelte-feather-icons'
  export let data;

  let formattedDate = new Date(data.created_at).toLocaleDateString()

  const editPlayer = () => {
    console.warn('Editing Player')
  }
</script>
<div class="mb-4 flex mt-4">
  <div class="flex w-1/2 justify-center">
    <button>
      <a href="/players">
        <ArrowLeftIcon size="2x" />
      </a>
    </button>
  </div>
  <div class="flex flex-auto w-1/2 justify-center">
    <button on:click={editPlayer}>
      <EditIcon size="2x"/>
    </button>
  </div>
</div>
<form METHOD="post" action="?/update">
  <div class="flex flex-col mt-4">
    <div class="flex flex-col w-full text-center">
      <label class="label h3" for="playerName">Name</label>
      <input type="text"
             name="playerName"
             id="playerName"
             placeholder={data.name}
             disabled>
    </div>
    <div class="flex">
      <div class="flex flex-col w-1/2 text-center mt-2">
        <label class="label h4" for="gamesPlayed">Games Played</label>
        <input class="text-center"
               type="text"
               name="gamesPlayed"
               id="gamesPlayed"
               placeholder={data.gamesPlayed ?? 0}
               disabled>
      </div>
      <div class="flex flex-col w-1/2 text-center mt-2">
        <label class="label h4" for="gamesWon">Games Played</label>
        <input class="text-center"
               type="text"
               name="gamesWon"
               id="gamesWon"
               placeholder={data.gamesWon ?? 0}
               disabled>
      </div>
    </div>
    <div class="flex flex-col w-full text-center mt-2">
      <label class="label h3" for="createdAt">Created At</label>
      <input type="text"
             class="text-center"
             name="createdAt"
             id="createdAt"
             placeholder={formattedDate}
             disabled>
    </div>
  </div>

</form>




