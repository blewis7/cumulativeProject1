"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showTrashCan = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showStar = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
        ${showTrashCan ? getTrashBtn() : ''}
        ${showStar ? getFavoriteBtn(story, currentUser) : ''}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getTrashBtn(){
  return `
    <span id='delete-btn'> 
      <i class="fas fa-trash-alt"></i>
    </span>
  `;
}

function getFavoriteBtn(story, user){
  const favorites = user.isFavorite(story);
  const type = favorites ? "fas" : "far";
  return `
    <span id='favorite-btn'>
      <i class='${type} fa-star'></i>
    </span>
  `;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function removeMyStory(e){
  console.debug('removeMyStory');

  const $closestLi = $(e.target).closest('li');
  const storyId = $closestLi.attr('id');

  await storyList.removeStory(currentUser, storyId);

  await showMyStories();
}

$myStoriesList.on('click', '#delete-btn', removeMyStory);


async function addNewStory(e){
  console.debug("addNewStory");
  e.preventDefault();

  const author = $('#author-name').val();
  const title = $('#title-name').val();
  const url = $('#url-name').val();
  const storyData = {title, author, url};

  const story = await storyList.addStory(currentUser, storyData);
  $allStoriesList.prepend(generateStoryMarkup(story));

  $('#author-name').val('');
  $('#title-name').val('');
  $('#url-name').val('');
  putStoriesOnPage();
  
}

$('#create-new-story').on('click', addNewStory);

async function showMyStories(){
  console.debug('showMyStories');

  $myStoriesList.empty();
  
  if (currentUser.ownStories.length === 0){
    $myStoriesList.append(`<h4>You have no stories</h4>`);
  } else {
    for (let story of currentUser.ownStories){
      $myStoriesList.append(generateStoryMarkup(story, true));
    }
  }
  $myStoriesList.show();
}

async function putFavoritesOnPage(){
  console.debug('putFavoritesOnPage');

  $favoritesList.empty();
  
  if (currentUser.favorites.length === 0){
    $favoritesList.append(`<h4>You have no favorites</h4>`);
  } else {
    for (let story of currentUser.favorites){
      $favoritesList.append(generateStoryMarkup(story, false));
    }
  }
  $favoritesList.show();  
}

async function toggleFavorites(e){
  console.debug('toggleFavorites');

  const $target = $(e.target);
  const $closestLi = $target.closest('li');
  const storyId = $closestLi.attr('id');
  const story = storyList.stories.find(st => st.storyId === storyId);

  if ($target.hasClass('fas')){
    await currentUser.removeFavorite(story);
    $target.closest('i').toggleClass('fas far');
  } else {
    await currentUser.addFavorite(story);
    $target.closest('i').toggleClass('fas far');
  }
}

$storiesList.on('click', '#favorite-btn', toggleFavorites);




