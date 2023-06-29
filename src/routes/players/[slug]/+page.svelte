<script>
  export let data;

  let formattedDate = new Date(data.created_at).toLocaleDateString()
</script>

<h1>Player Details</h1>
<hr />
<p>{data.name}</p>
<hr />
<p><b>Games Played / Games Won</b></p>
<p>{data.games_played ?? 0} / {data.games_won ?? 0}</p>
<hr />
<p>Created Date: {formattedDate}</p>

<a href="/players">Return to Players</a>

