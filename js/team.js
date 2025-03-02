async function loadTeamMembers() {
  const teamGrid = document.querySelector('.team-grid');
  if (!teamGrid) return;
  
  try {
    const response = await fetch('team/index.json');
    if (!response.ok) {
      throw new Error('Failed to load team data index');
    }
    
    const teamIndex = await response.json();
    const teamFiles = teamIndex?.members || [];
    
    if (teamFiles.length === 0) {
      teamGrid.innerHTML = '<div class="no-data">No team members found</div>';
      return;
    }
    
    teamGrid.innerHTML = '';
    
    let priorityMembers = [];
    let otherMembers = [];
    
    for (const file of teamFiles) {
      try {
        const memberResponse = await fetch(`team/${file}`);
        if (memberResponse.ok) {
          const memberData = await memberResponse.json();
          
          if (memberData.priority === true) {
            priorityMembers.push(memberData);
          } else {
            otherMembers.push(memberData);
          }
        }
      } catch (error) {
        const errorMsg = `Error loading team member file ${file}:`;
        console.error(handleError(errorMsg, error));
      }
    }
    
    priorityMembers.forEach(member => {
      const memberElement = createTeamMemberElement(member);
      teamGrid.appendChild(memberElement);
    });
    
    if (otherMembers.length > 0) {
      const showMoreContainer = document.createElement('div');
      showMoreContainer.className = 'show-more-container';
      showMoreContainer.style.gridColumn = '1 / -1';
      showMoreContainer.style.textAlign = 'center';
      showMoreContainer.style.margin = '20px 0';
      
      const showMoreButton = document.createElement('button');
      showMoreButton.className = 'cta-button';
      showMoreButton.textContent = `Show More (${otherMembers.length})`;
      showMoreButton.addEventListener('click', () => {
        showMoreContainer.remove();
        
        otherMembers.forEach(member => {
          const memberElement = createTeamMemberElement(member);
          teamGrid.appendChild(memberElement);
        });
      });
      
      showMoreContainer.appendChild(showMoreButton);
      teamGrid.appendChild(showMoreContainer);
    }
    
  } catch (error) {
    const errorMsg = 'Error loading team members:';
    console.error(handleError(errorMsg, error));
    teamGrid.innerHTML = '<div class="error">Failed to load team members</div>';
  }
}

function createTeamMemberElement(member) {
  const memberElement = document.createElement('div');
  memberElement.className = 'team-member';
  
  const avatarElement = document.createElement('div');
  avatarElement.className = 'member-avatar';
  
  if (member.avatar) {
    const img = document.createElement('img');
    img.src = member.avatar;
    img.alt = `${member.name}'s avatar`;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';
    img.onerror = function() {
      avatarElement.innerHTML = '<i class="fas fa-user-circle"></i>';
    };
    avatarElement.appendChild(img);
  } else {
    const icon = document.createElement('i');
    icon.className = 'fas fa-user-circle';
    avatarElement.appendChild(icon);
  }
  
  const infoElement = document.createElement('div');
  infoElement.className = 'member-info';
  
  const nameElement = document.createElement('h4');
  nameElement.textContent = member.name || 'Team Member';
  
  const roleElement = document.createElement('p');
  roleElement.textContent = member.role || 'Contributor';
  
  infoElement.appendChild(nameElement);
  infoElement.appendChild(roleElement);
  
  memberElement.appendChild(avatarElement);
  memberElement.appendChild(infoElement);
  
  if (member.social && Object.keys(member.social).length > 0) {
    const socialLinks = document.createElement('div');
    socialLinks.className = 'member-social';
    
    for (const [platform, url] of Object.entries(member.social)) {
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `${member.name}'s ${platform}`);
        
        let icon;
        switch(platform.toLowerCase()) {
          case 'twitter':
            icon = 'fa-twitter';
            break;
          case 'discord':
            icon = 'fa-discord';
            break;
          case 'instagram':
            icon = 'fa-instagram';
            break;
          case 'github':
            icon = 'fa-github';
            break;
          default:
            icon = 'fa-link';
        }
        
        link.innerHTML = `<i class="fab ${icon}"></i>`;
        socialLinks.appendChild(link);
      }
    }
    
    if (socialLinks.children.length > 0) {
      infoElement.appendChild(socialLinks);
    }
  }
  
  return memberElement;
}