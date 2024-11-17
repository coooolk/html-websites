document.addEventListener('DOMContentLoaded', () => {
     // Fetch COVID-19 statistics
     fetch('https://api.covid19api.com/summary')
         .then(response => response.json())
         .then(data => {
             const stats = data.Global;
             document.getElementById('statistics').innerHTML = `
                 <p>New Confirmed: ${stats.NewConfirmed}</p>
                 <p>Total Confirmed: ${stats.TotalConfirmed}</p>
                 <p>New Deaths: ${stats.NewDeaths}</p>
                 <p>Total Deaths: ${stats.TotalDeaths}</p>
             `;
         })
         .catch(error => console.error('Error fetching COVID-19 data:', error));
 
     // Fetch comments
     fetch('get_comments.php')
         .then(response => response.json())
         .then(comments => {
             const commentList = document.getElementById('comment-list');
             comments.forEach(comment => {
                 const commentElement = document.createElement('p');
                 commentElement.textContent = comment.text;
                 commentList.appendChild(commentElement);
             });
         })
         .catch(error => console.error('Error fetching comments:', error));
 });