<script>
  export let data;
</script>

<h1>Player Details</h1>
<p>{data.player.name}</p>
<p><b>Games Played / Games Won</b></p>
<p>{data.player.games_played ?? 0} / {data.player.games_won ?? 0}</p>
<hr />
<p>Created Date: {data.player.created_at}</p>

